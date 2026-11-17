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
    query GetShopPolicies {
      shop {
        name
        primaryDomain {
          url
          host
        }
        paymentSettings {
          currencyCode
        }
        shippingPolicy {
          id
          title
          body
          handle
          url
        }
        refundPolicy {
          id
          title
          body
          handle
          url
        }
        privacyPolicy {
          id
          title
          body
          handle
          url
        }
        termsOfService {
          id
          title
          body
          handle
          url
        }
      }
    }
  `;

  const fallbackProcess = {
    processingTime: '24 - 48 Hours',
    carrierPartners: ['Royal Mail', 'Evri', 'USPS', 'Australia Post', 'Canada Post', 'DHL Express'],
    countryEstimates: [
      { code: 'GBP', country: 'United Kingdom', estimate: '3 - 5 business days', cost: 'FREE', method: 'Tracked & Insured Delivery' },
      { code: 'USD', country: 'United States',  estimate: '4 - 7 business days', cost: 'FREE', method: 'USPS Tracked Shipping' },
      { code: 'AUD', country: 'Australia',      estimate: '5 - 8 business days', cost: 'FAST TRACKED', method: 'AusPost Tracked Shipping' },
      { code: 'EUR', country: 'Europe',         estimate: '4 - 7 business days', cost: 'FAST TRACKED', method: 'Priority Tracked Delivery' },
      { code: 'CAD', country: 'Canada',         estimate: '5 - 8 business days', cost: 'FAST TRACKED', method: 'Canada Post Tracked' },
      { code: 'NZD', country: 'New Zealand',    estimate: '5 - 9 business days', cost: 'FAST TRACKED', method: 'NZ Post Tracked' },
    ],
    steps: [
      {
        step: 1,
        title: 'Order Processing',
        time: 'Within 24 Hours',
        description: 'Your order is securely verified and forwarded to our fulfillment warehouse for picking and inspection.',
        icon: 'package'
      },
      {
        step: 2,
        title: 'Quality Check & Packing',
        time: 'Day 1 - 2',
        description: 'Each Grip Glow unit is individually tested, packed with shock-resistant cushioning, and prepared for dispatch.',
        icon: 'check'
      },
      {
        step: 3,
        title: 'Dispatched with Live Tracking',
        time: 'Day 2',
        description: 'Your parcel is handed to the local express courier. You receive an automated tracking link by email and SMS.',
        icon: 'truck'
      },
      {
        step: 4,
        title: 'Doorstep Delivery',
        time: '3 - 5 Days (UK) / 4 - 7 Days (Intl)',
        description: 'Delivered securely to your address. Fully backed by our 30-day money-back guarantee.',
        icon: 'home'
      }
    ],
    faq: [
      {
        question: 'How long does order processing take?',
        answer: 'All orders are processed and inspected at our fulfillment center within 24 to 48 hours (excluding weekends and public holidays).'
      },
      {
        question: 'When will I receive my tracking number?',
        answer: 'You will automatically receive an email confirmation containing your live tracking code as soon as the courier scans your parcel at the dispatch facility.'
      },
      {
        question: 'Which countries do you ship to?',
        answer: 'We provide tracked and insured delivery to the United Kingdom, United States, Australia, Canada, New Zealand, and all European Union countries.'
      },
      {
        question: 'Are customs, duties, and taxes included?',
        answer: 'Yes! All applicable customs duties and import taxes are prepaid and included. There are zero surprise fees upon delivery.'
      },
      {
        question: 'What if my package arrives damaged or delayed?',
        answer: 'Every shipment is 100% insured. If your package is delayed, lost, or damaged in transit, contact us at contact@gripglow.com and we will immediately issue a free replacement or full refund.'
      }
    ]
  };

  try {
    const postData = JSON.stringify({ query });
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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

    let json = {};
    try {
      json = JSON.parse(shopifyRes.body);
    } catch {
      // Return fallback gracefully if Shopify response isn't JSON
    }

    const shop = json.data?.shop || null;
    const shippingPolicy = shop?.shippingPolicy || null;

    return res.status(200).json({
      success: true,
      shopName: shop?.name || 'Grip Glow',
      shippingPolicy,
      refundPolicy: shop?.refundPolicy || null,
      privacyPolicy: shop?.privacyPolicy || null,
      termsOfService: shop?.termsOfService || null,
      process: fallbackProcess,
      isShopifyLive: Boolean(shippingPolicy?.body)
    });
  } catch (err) {
    // Graceful fallback so frontend always displays clean shipping information
    return res.status(200).json({
      success: true,
      shopName: 'Grip Glow',
      shippingPolicy: null,
      refundPolicy: null,
      privacyPolicy: null,
      termsOfService: null,
      process: fallbackProcess,
      isShopifyLive: false,
      error: err.message
    });
  }
}
