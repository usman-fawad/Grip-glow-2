// Shopify Storefront API Service

// Configuration - domain will be updated once provided by the merchant
export const SHOPIFY_CONFIG = {
  domain: 'motht-1m.myshopify.com', // Enter your myshopify domain here (e.g. your-store.myshopify.com)
  storefrontAccessToken: '16ccefd5c4a7e518daf939f2888d0ea2',
  apiVersion: '2024-10',
};

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
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error('[Shopify Storefront API Errors]', json.errors);
      return null;
    }

    return json.data;
  } catch (err) {
    console.warn('[Shopify Storefront API Network Error]', err);
    return null;
  }
}

// 1. Fetch products & variants from Shopify
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

// 2. Create Cart
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
        field
        message
      }
    }
  }
`;

// 3. Add to Cart
export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
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
        field
        message
      }
    }
  }
`;

// 4. Update Cart Lines
export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
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
      }
    }
  }
`;

// Helper: Fetch first or primary product
export async function getShopifyProduct() {
  const data = await shopifyFetch({ query: GET_PRODUCTS_QUERY, variables: { first: 5 } });
  if (data?.products?.nodes?.length > 0) {
    return data.products.nodes[0];
  }
  return null;
}

// Helper: Create Shopify cart and get checkout URL
export async function createShopifyCart(lines) {
  const data = await shopifyFetch({
    query: CART_CREATE_MUTATION,
    variables: { input: { lines } },
  });
  return data?.cartCreate?.cart || null;
}

// Helper: Add items to Shopify cart
export async function addLinesToShopifyCart(cartId, lines) {
  const data = await shopifyFetch({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
  });
  return data?.cartLinesAdd?.cart || null;
}

