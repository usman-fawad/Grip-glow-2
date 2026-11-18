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
 * Strip query string / hash so Shopify CDN image URLs match consistently
 */
export function normalizeShopifyUrl(url) {
  if (!url) return '';
  return String(url).split('?')[0].split('#')[0].trim();
}

/**
 * Extract variant display color label
 */
function getVariantColor(variant) {
  if (!variant) return null;
  const opt = variant.selectedOptions?.find(
    (o) => o.name && /colou?r/i.test(o.name)
  );
  return (opt?.value || variant.title || '').trim() || null;
}

/**
 * Build product gallery media list purely from Shopify product data
 */
export function buildShopifyGallery(product) {
  if (!product) return [];

  const title = product.title || 'Magnetic Work Light';
  const urlToColor = new Map();

  for (const variant of product.variants?.nodes || []) {
    const color = getVariantColor(variant);
    const key = normalizeShopifyUrl(variant.image?.url);
    if (color && key && !urlToColor.has(key)) {
      urlToColor.set(key, color);
    }
  }

  const gallery = [];
  const seenUrls = new Set();

  const pushImage = (img, altOverride) => {
    const url = img?.url;
    const key = normalizeShopifyUrl(url);
    if (!url || seenUrls.has(key)) return;
    seenUrls.add(key);
    gallery.push({
      src: url,
      alt: img.altText || altOverride || title,
      color: urlToColor.get(key) || undefined,
      isVideo: false,
    });
  };

  // 1. Prefer Shopify `media` list (preserves Admin order including product video)
  for (const node of product.media?.nodes || []) {
    if (node.mediaContentType === 'IMAGE' && node.image?.url) {
      pushImage(node.image, node.alt);
    } else if (node.mediaContentType === 'VIDEO' && Array.isArray(node.sources)) {
      const mp4 = node.sources
        .filter((s) => s?.url && (s.mimeType === 'video/mp4' || s.format === 'mp4'))
        .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
      if (mp4?.url && !seenUrls.has(normalizeShopifyUrl(mp4.url))) {
        seenUrls.add(normalizeShopifyUrl(mp4.url));
        gallery.push({
          src: mp4.url,
          poster: node.previewImage?.url || undefined,
          alt: node.alt || `${title} - Video`,
          isVideo: true,
        });
      }
    }
  }

  // 2. Fallback / supplement with `images` and `featuredImage` / variant images
  for (const img of product.images?.nodes || []) {
    pushImage(img);
  }
  if (product.featuredImage?.url) {
    pushImage(product.featuredImage);
  }
  for (const variant of product.variants?.nodes || []) {
    if (variant.image?.url) {
      pushImage(variant.image);
    }
  }

  return gallery;
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
export async function createShopifyCart(lines, countryCode = 'GB') {
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
    body: JSON.stringify({ lines: formattedLines, countryCode }),
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

/**
 * Fetch Shopify shipping process & policies via secure backend API (/api/shopify/shipping)
 */
export async function getShopifyShipping() {
  try {
    const res = await fetch('/api/shopify/shipping', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[Shopify Service] Shipping fetch notice:', err.message);
    return null;
  }
}
