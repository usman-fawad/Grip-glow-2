// Shopify Storefront API Integration Service

export const SHOPIFY_CONFIG = {
  domain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOPIFY_DOMAIN) || 'motht-1m.myshopify.com',
  storefrontAccessToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOPIFY_STOREFRONT_TOKEN) || '16ccefd5c4a7e518daf939f2888d0ea2',
  apiVersion: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOPIFY_API_VERSION) || '2024-10',
};

/**
 * Direct Client-Side Storefront API Fetcher (Uses Public Token)
 */
export async function shopifyFetch({ query, variables = {} }) {
  const endpoint = `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.warn(`[Shopify Storefront API] HTTP ${res.status} from ${endpoint}`);
      return { ok: false, status: res.status, errors: [{ message: `HTTP ${res.status}` }] };
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      console.error('[Shopify Storefront API Errors]', json.errors);
      return { ok: false, status: 200, errors: json.errors };
    }

    return { ok: true, data: json.data };
  } catch (err) {
    console.warn('[Shopify Storefront API Network Error]', err);
    return { ok: false, status: 0, error: err.message };
  }
}

// -------------------------------------------------------------
// GraphQL Operations
// -------------------------------------------------------------

export const GET_PRODUCTS_QUERY = `
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
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
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
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                }
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                }
              }
            }
          }
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

/**
 * Format merchandise ID to Shopify GID format if needed
 */
export function formatVariantId(id) {
  if (!id) return id;
  const str = String(id).trim();
  if (str.startsWith('gid://shopify/ProductVariant/')) return str;
  // If it's purely digits or starts with gid
  const digitsMatch = str.match(/\d+$/);
  if (digitsMatch) {
    return `gid://shopify/ProductVariant/${digitsMatch[0]}`;
  }
  return str;
}

/**
 * Helper to match variant by color/title/option
 */
export function matchVariant(variants, colorName) {
  if (!variants || !Array.isArray(variants) || variants.length === 0) return null;
  const target = colorName.toLowerCase().trim();

  // 1. Direct title match
  let found = variants.find(v => v.title && v.title.toLowerCase().trim() === target);
  if (found) return found;

  // 2. Selected option value match (e.g., Color -> Yellow)
  found = variants.find(v =>
    v.selectedOptions && v.selectedOptions.some(o => o.value && o.value.toLowerCase().trim() === target)
  );
  if (found) return found;

  // 3. Substring match
  found = variants.find(v => v.title && v.title.toLowerCase().includes(target));
  if (found) return found;

  return variants[0];
}

/**
 * Create Shopify Cart and retrieve checkoutUrl
 * Uses server-side endpoint first (protecting private tokens), with client-side fallback
 */
export async function createShopifyCart(lines) {
  if (!lines || lines.length === 0) {
    throw new Error('Your cart is empty. Please add items before checking out.');
  }

  // Format line items
  const formattedLines = lines.map(line => ({
    merchandiseId: formatVariantId(line.merchandiseId || line.variantId || line.id),
    quantity: parseInt(line.quantity, 10) || 1,
  }));

  // 1. Try server-side proxy endpoint first (Requirement 9)
  try {
    const serverRes = await fetch('/api/shopify/cart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: formattedLines }),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.success && data.checkoutUrl) {
        return data.cart;
      }
      if (data.error) {
        throw new Error(data.error);
      }
    } else if (serverRes.status !== 404 && serverRes.status !== 502) {
      const errorJson = await serverRes.json().catch(() => ({}));
      if (errorJson.error) {
        throw new Error(errorJson.error);
      }
    }
  } catch (serverErr) {
    // If it's an explicit error from our API, rethrow
    if (serverErr.message && !serverErr.message.includes('Failed to fetch') && !serverErr.message.includes('404')) {
      console.warn('[Shopify Server Proxy Notice]', serverErr.message);
    }
  }

  // 2. Client-side Storefront API Fallback (Using Public Access Token)
  const clientRes = await shopifyFetch({
    query: CART_CREATE_MUTATION,
    variables: { input: { lines: formattedLines } },
  });

  if (!clientRes.ok) {
    if (clientRes.status === 404 || clientRes.status === 0) {
      throw new Error(`Unable to reach Shopify store (${SHOPIFY_CONFIG.domain}). Please verify the Shopify domain is active.`);
    }
    const errMsg = clientRes.errors?.map(e => e.message).join(', ') || 'Checkout service unavailable.';
    throw new Error(`Shopify Storefront error: ${errMsg}`);
  }

  const result = clientRes.data?.cartCreate;
  if (result?.userErrors && result.userErrors.length > 0) {
    const errorMsg = result.userErrors.map(e => e.message).join('. ');
    throw new Error(errorMsg);
  }

  if (!result?.cart?.checkoutUrl) {
    throw new Error('Could not retrieve Shopify checkout URL.');
  }

  return result.cart;
}

/**
 * Fetch product data from Shopify
 */
export async function getShopifyProduct() {
  // Try server endpoint first
  try {
    const res = await fetch('/api/shopify/products');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.products?.length > 0) {
        return data.products[0];
      }
    }
  } catch (e) {
    // Fall back to client fetch
  }

  // Client fallback
  const clientRes = await shopifyFetch({
    query: GET_PRODUCTS_QUERY,
    variables: { first: 5 },
  });

  if (clientRes.ok && clientRes.data?.products?.nodes?.length > 0) {
    return clientRes.data.products.nodes[0];
  }

  return null;
}
