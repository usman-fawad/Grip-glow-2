import https from 'https';

async function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) {
        req.destroy();
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON request body'));
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || 'fm0tht-mf.myshopify.com';
  const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '16ccefd5c4a7e518daf939f2888d0ea2';
  const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';
  const SHOPIFY_PRIVATE_TOKEN = process.env.SHOPIFY_PRIVATE_TOKEN || '';

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }

  const lines = body?.lines || [];
  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ success: false, error: 'No items in cart' });
  }

  const formattedLines = lines.map(line => {
    let merchandiseId = line.merchandiseId || line.variantId || line.id;
    if (merchandiseId && !merchandiseId.toString().startsWith('gid://')) {
      merchandiseId = `gid://shopify/ProductVariant/${merchandiseId}`;
    }
    return {
      merchandiseId,
      quantity: Math.max(1, parseInt(line.quantity, 10) || 1),
    };
  });

  const CURRENCY_TO_COUNTRY = {
    GBP: 'GB',
    USD: 'US',
    AUD: 'AU',
    EUR: 'DE',
    NZD: 'NZ',
    CAD: 'CA',
  };

  const rawCountry = String(body?.countryCode || 'GB').toUpperCase().trim();
  const requestedCountry = CURRENCY_TO_COUNTRY[rawCountry] || (/^[A-Z]{2}$/.test(rawCountry) ? rawCountry : 'GB');

  const mutation = `
    mutation CartCreate($input: CartInput!, $country: CountryCode) @inContext(country: $country) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          buyerIdentity {
            countryCode
          }
          discountCodes {
            code
            applicable
          }
          discountAllocations {
            discountedAmount {
              amount
              currencyCode
            }
          }
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              cost {
                amountPerQuantity {
                  amount
                  currencyCode
                }
                subtotalAmount {
                  amount
                  currencyCode
                }
                totalAmount {
                  amount
                  currencyCode
                }
              }
              discountAllocations {
                discountedAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  availableForSale
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
          code
        }
        warnings {
          code
          message
        }
      }
    }
  `;

  const callShopifyCartCreate = async (countryCode) => {
    const postData = JSON.stringify({
      query: mutation,
      variables: {
        country: countryCode,
        input: {
          lines: formattedLines,
          buyerIdentity: { countryCode },
        },
      },
    });

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'GripGlowHeadless/1.0',
    };

    if (SHOPIFY_PRIVATE_TOKEN) {
      headers['Shopify-Storefront-Private-Token'] = SHOPIFY_PRIVATE_TOKEN;
    } else {
      headers['X-Shopify-Storefront-Access-Token'] = SHOPIFY_STOREFRONT_TOKEN;
    }

    const shopifyRes = await new Promise((resolve, reject) => {
      const r = https.request({
        hostname: SHOPIFY_DOMAIN,
        path: `/api/${SHOPIFY_API_VERSION}/graphql.json`,
        method: 'POST',
        headers,
        timeout: 10000,
      }, (resp) => {
        let respBody = '';
        resp.on('data', chunk => { respBody += chunk; });
        resp.on('end', () => resolve({ status: resp.statusCode, body: respBody }));
      });
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('Shopify request timed out')); });
      r.write(postData);
      r.end();
    });

    let json;
    try {
      json = JSON.parse(shopifyRes.body);
    } catch {
      return { status: 502, error: `Unexpected non-JSON response from Shopify (HTTP ${shopifyRes.status}).` };
    }

    if (shopifyRes.status !== 200 || (json.errors && json.errors.length > 0)) {
      const msg = json.errors?.map(e => e.message).join(', ') || `Shopify responded with HTTP ${shopifyRes.status}. Please check your shop domain.`;
      return { status: shopifyRes.status === 200 ? 502 : (shopifyRes.status || 502), error: msg };
    }

    return { status: 200, cartData: json.data?.cartCreate };
  };

  try {
    let result = await callShopifyCartCreate(requestedCountry);
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    let cartData = result.cartData;
    const isOutOfStock =
      cartData?.cart?.totalQuantity === 0 ||
      (cartData?.warnings || []).some(w => w.code === 'MERCHANDISE_OUT_OF_STOCK');

    // If the requested country doesn't have an active Shopify Market / Shipping Zone yet,
    // fall back to GB (primary stocked UK warehouse) so checkout opens with stock intact.
    if (isOutOfStock && requestedCountry !== 'GB') {
      const fallbackResult = await callShopifyCartCreate('GB');
      if (!fallbackResult.error && fallbackResult.cartData?.cart?.totalQuantity > 0) {
        cartData = fallbackResult.cartData;
      }
    }

    if (cartData?.userErrors && cartData.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: cartData.userErrors.map(e => e.message).join(', '),
        userErrors: cartData.userErrors,
      });
    }

    if (!cartData?.cart?.checkoutUrl) {
      return res.status(500).json({
        success: false,
        error: 'Shopify did not return a valid checkout URL.',
      });
    }

    return res.status(200).json({
      success: true,
      checkoutUrl: cartData.cart.checkoutUrl,
      cart: cartData.cart,
      warnings: cartData.warnings || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error creating Shopify cart.',
    });
  }
}
