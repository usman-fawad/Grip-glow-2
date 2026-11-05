import https from 'https';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || process.env.VITE_SHOPIFY_DOMAIN || 'motht-1m.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '16ccefd5c4a7e518daf939f2888d0ea2';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';
const SHOPIFY_PRIVATE_TOKEN = process.env.SHOPIFY_PRIVATE_TOKEN || '';

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

  const lines = req.body?.lines || [];
  if (!lines || lines.length === 0) {
    return res.status(400).json({ success: false, error: 'No items in cart' });
  }

  const formattedLines = lines.map(line => {
    let merchandiseId = line.merchandiseId || line.variantId || line.id;
    if (merchandiseId && !merchandiseId.toString().startsWith('gid://')) {
      merchandiseId = `gid://shopify/ProductVariant/${merchandiseId}`;
    }
    return {
      merchandiseId,
      quantity: parseInt(line.quantity, 10) || 1,
    };
  });

  const mutation = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  try {
    const postData = JSON.stringify({
      query: mutation,
      variables: { input: { lines: formattedLines } },
    });

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'ShopifyHeadless/1.0',
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

    const json = JSON.parse(shopifyRes.body);

    if (shopifyRes.status !== 200 || !json.data) {
      return res.status(shopifyRes.status || 502).json({
        success: false,
        error: `Shopify responded with HTTP ${shopifyRes.status}. Please check your shop domain.`,
        details: json,
      });
    }

    const cartData = json.data?.cartCreate;
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
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error creating cart',
    });
  }
}
