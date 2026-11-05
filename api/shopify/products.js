import https from 'https';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || process.env.VITE_SHOPIFY_DOMAIN || 'motht-1m.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '16ccefd5c4a7e518daf939f2888d0ea2';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';
const SHOPIFY_PRIVATE_TOKEN = process.env.SHOPIFY_PRIVATE_TOKEN || '';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = `
    query GetProducts($first: Int = 10) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          description
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 20) {
            nodes {
              id
              url
              altText
            }
          }
          options {
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
              selectedOptions {
                name
                value
              }
              image {
                url
              }
            }
          }
        }
      }
    }
  `;

  try {
    const postData = JSON.stringify({ query });
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
      r.on('timeout', () => { r.destroy(); reject(new Error('Timeout')); });
      r.write(postData);
      r.end();
    });

    const json = JSON.parse(shopifyRes.body);
    if (shopifyRes.status === 200 && json.data) {
      return res.status(200).json({
        success: true,
        products: json.data.products?.nodes || [],
      });
    }

    return res.status(shopifyRes.status || 502).json({
      success: false,
      error: `Shopify responded with HTTP ${shopifyRes.status}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
