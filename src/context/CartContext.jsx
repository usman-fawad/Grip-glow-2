import { createContext, useContext, useState, useCallback } from 'react';
import { createShopifyCart } from '../services/shopify';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
    setCheckoutError(null);
    setIsOpen(true);
  }, []);

  const addItems = useCallback((newItems) => {
    setItems(prev => {
      let updated = [...prev];
      for (const item of newItems) {
        const existing = updated.find(i => i.id === item.id);
        if (existing) {
          updated = updated.map(i => i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i);
        } else {
          updated.push({ ...item, qty: item.qty || 1 });
        }
      }
      return updated;
    });
    setCheckoutError(null);
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const clearCheckoutError = useCallback(() => {
    setCheckoutError(null);
  }, []);

  /**
   * Shopify Real Hosted Checkout Flow
   * Requirements:
   * - Never simulate payments or orders in frontend
   * - Retrieve cart checkoutUrl from Shopify Storefront API
   * - Redirect user to official Shopify hosted checkout
   */
  const proceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      setCheckoutError('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Build lines for Shopify Storefront API CartInput
      const lines = [];

      items.forEach(item => {
        // If the item carries multiple bundled lines with shopifyVariantIds
        if (item.bundledLines && Array.isArray(item.bundledLines)) {
          item.bundledLines.forEach(bl => {
            lines.push({
              merchandiseId: bl.shopifyVariantId || bl.variantId || bl.id,
              quantity: (bl.qty || 1) * item.qty,
            });
          });
        } else {
          lines.push({
            merchandiseId: item.shopifyVariantId || item.variantId || item.id,
            quantity: item.qty,
          });
        }
      });

      console.log('[Shopify Checkout] Initiating cartCreate with lines:', lines);

      const cart = await createShopifyCart(lines);

      if (!cart || !cart.checkoutUrl) {
        throw new Error('Shopify did not provide a valid checkout URL.');
      }

      console.log('[Shopify Checkout] Redirecting to official Shopify checkout:', cart.checkoutUrl);

      // Redirect customer to official Shopify hosted checkout
      window.location.href = cart.checkoutUrl;
    } catch (err) {
      console.error('[Shopify Checkout Error]', err);
      let userFriendlyMsg = err.message || 'Unable to proceed to Shopify checkout.';
      if (userFriendlyMsg.includes('Failed to fetch') || userFriendlyMsg.includes('Network Error')) {
        userFriendlyMsg = 'Network error connecting to Shopify. Please check your connection and try again.';
      } else if (userFriendlyMsg.includes('does not exist')) {
        userFriendlyMsg = 'Product variant is not yet active on Shopify. Please verify product publishing in Shopify Admin.';
      }
      setCheckoutError(userFriendlyMsg);
      setIsCheckingOut(false);
    }
  }, [items]);

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addItems,
        removeItem,
        updateQty,
        clearCart,
        isOpen,
        setIsOpen,
        totalQty,
        totalPrice,
        isCheckingOut,
        checkoutError,
        clearCheckoutError,
        proceedToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
