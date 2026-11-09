// Shopify Frontend Service Layer
// All Shopify Storefront API calls are routed securely through /api/shopify/* server endpoints.
// Zero Shopify tokens or private credentials are stored or exposed in frontend code.

/**
 * Format merchandise ID to Shopify GID format if needed
 */
export function formatVariantId(id) {
  if (!id) return id;
  const str = String(id).trim();
  if (str.startsWith('gid://shopify/ProductVariant/')) return str;
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
  const target = (colorName || '').toLowerCase().trim();

  // 1. Direct title match
  let found = variants.find((v) => v.title && v.title.toLowerCase().trim() === target);
  if (found) return found;

  // 2. Selected option value match (e.g., Color -> Yellow)
  found = variants.find(
    (v) =>
      v.selectedOptions &&
      v.selectedOptions.some((o) => o.value && o.value.toLowerCase().trim() === target)
  );
  if (found) return found;

  // 3. Substring match
  found = variants.find((v) => v.title && v.title.toLowerCase().includes(target));
  if (found) return found;

  return variants[0];
}

/**
 * Fetch Shopify store + products payload through secure backend API (/api/shopify/products)
 */
export async function getShopifyStoreData() {
  const res = await fetch('/api/shopify/products', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `Failed to load Shopify products (HTTP ${res.status})`);
  }

  return {
    shop: data.shop || null,
    products: data.products || [],
  };
}

/**
 * Helper: Fetch primary product from Shopify via backend API
 */
export async function getShopifyProduct() {
  try {
    const { products } = await getShopifyStoreData();
    return products?.[0] || null;
  } catch (err) {
    console.warn('[Shopify Service] Product fetch notice:', err.message);
    return null;
  }
}

/**
 * Create Shopify Cart via secure backend API (/api/shopify/cart/create)
 */
export async function createShopifyCart(lines) {
  if (!lines || lines.length === 0) {
    throw new Error('Your cart is empty. Please add items before checking out.');
  }

  const formattedLines = lines.map((line) => ({
    merchandiseId: formatVariantId(line.merchandiseId || line.variantId || line.id),
    quantity: parseInt(line.quantity, 10) || 1,
  }));

  const res = await fetch('/api/shopify/cart/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines: formattedLines }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `Checkout service returned HTTP ${res.status}.`);
  }

  if (!data?.checkoutUrl || !data?.cart) {
    throw new Error('Shopify did not return a valid checkout URL.');
  }

  return data.cart;
}
