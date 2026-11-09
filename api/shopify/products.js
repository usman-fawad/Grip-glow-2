import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || 'fm0tht-mf.myshopify.com';
  const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '16ccefd5c4a7e518daf939f2888d0ea2';
  const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';
  const SHOPIFY_PRIVATE_TOKEN = process.env.SHOPIFY_PRIVATE_TOKEN || '';

  const query = `
    query GetProducts($first: Int = 10) {
      shop {
        name
        primaryDomain {
          url
          host
        }
        paymentSettings {
          currencyCode
        }
      }
      products(first: $first) {
        nodes {
          id
          title
          handle
          description
          descriptionHtml
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 20) {
            nodes {
              id
              url
              altText
              width
              height
            }
          }
          options {
            id
            name
            values
          }
          variants(first: 50) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                id
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  try {
    const postData = JSON.stringify({ query, variables: { first: 10 } });
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
        let body = '';
        resp.on('data', chunk => { body += chunk; });
        resp.on('end', () => resolve({ status: resp.statusCode, body }));
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
      return res.status(502).json({
        success: false,
        error: `Unexpected non-JSON response from Shopify (HTTP ${shopifyRes.status}).`,
      });
    }

    if (shopifyRes.status !== 200 || (json.errors && json.errors.length > 0)) {
      const msg = json.errors?.map(e => e.message).join(', ') || `Shopify responded with HTTP ${shopifyRes.status}`;
      return res.status(shopifyRes.status === 200 ? 502 : (shopifyRes.status || 502)).json({
        success: false,
        error: msg,
      });
    }

    if (!json.data) {
      return res.status(502).json({
        success: false,
        error: 'Shopify returned an empty data payload.',
      });
    }

    return res.status(200).json({
      success: true,
      shop: json.data.shop || null,
      products: json.data.products?.nodes || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error fetching Shopify products.',
    });
  }
}
