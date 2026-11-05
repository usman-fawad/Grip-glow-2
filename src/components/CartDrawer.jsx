import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCountry } from '../context/CountryContext';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQty,
    totalPrice,
    totalQty,
    isCheckingOut,
    checkoutError,
    proceedToCheckout,
  } = useCart();
  const { selectedCountry } = useCountry();

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setIsOpen]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatPrice = (amount) => {
    if (selectedCountry?.code === 'GBP') {
      return `£${amount.toFixed(2)}`;
    }
    const symbol = selectedCountry?.code === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)} ${selectedCountry?.code || 'AUD'}`;
  };

  return (
    <>
      <div
        className={`cart-backdrop${isOpen ? ' open' : ''}`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`cart-drawer${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* 1. Header */}
        <div className="cart-drawer__head">
          <div className="cart-drawer__head-left">
            <div className="cart-drawer__bag-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div className="cart-drawer__title-wrap">
              <h2 className="cart-drawer__title">YOUR CART</h2>
              <span className="cart-drawer__count">{totalQty} {totalQty === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
          <button
            type="button"
            className="cart-drawer__close"
            aria-label="Close cart"
            onClick={() => setIsOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 2. Product Items list */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="cart-empty__text">Your cart is empty</p>
              <button
                type="button"
                className="cart-empty__btn"
                onClick={() => setIsOpen(false)}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="cart-items-list" aria-label="Cart items">
              {items.map((item) => {
                const itemTitle = item.title || item.name.split('(')[0].trim() || 'The Grip Glow Magnetic Work Light';
                const itemVariant = item.variant || (item.name.includes('(') ? item.name.match(/\((.*?)\)/)?.[1] : null) || 'Stealth Edition';

                return (
                  <li key={item.id} className="cart-item">
                    <div className="cart-item__img-box">
                      <img src={item.img} alt={itemTitle} className="cart-item__img" />
                    </div>
                    <div className="cart-item__content">
                      <div className="cart-item__header-row">
                        <div className="cart-item__names">
                          <h3 className="cart-item__title">{itemTitle}</h3>
                          <p className="cart-item__variant">{itemVariant}</p>
                        </div>
                        <button
                          type="button"
                          className="cart-item__trash-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${itemTitle} from cart`}
                          title="Remove item"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>

                      <div className="cart-item__footer-row">
                        <div className="cart-item__qty-pill">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            aria-label={`Decrease quantity of ${itemTitle}`}
                          >−</button>
                          <span className="cart-item__qty-val">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            aria-label={`Increase quantity of ${itemTitle}`}
                          >+</button>
                        </div>
                        <div className="cart-item__price-wrap">
                          <div className="cart-item__price">
                            {formatPrice(item.price * item.qty)}
                          </div>
                          {item.qty > 1 && (
                            <span className="cart-item__unit-price">
                              {formatPrice(item.price)} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Cart Footer Elements */}
        {items.length > 0 && (
          <div className="cart-drawer__foot">
            {/* Subtotal */}
            <div className="cart-summary-row cart-summary-row--subtotal">
              <span className="cart-summary-label">Subtotal</span>
              <span className="cart-summary-value">{formatPrice(totalPrice)}</span>
            </div>

            {/* Total */}
            <div className="cart-summary-row cart-summary-row--total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">{formatPrice(totalPrice)}</span>
            </div>

            {/* Trust Badges */}
            <div className="cart-trust-badges">
              <img
                src="/cart-trust-badges.png"
                alt="Free Delivery · 30-Day Returns · Trusted Quality"
                className="cart-trust-badges-img"
              />
            </div>

            {/* Highlighted tracked delivery notice */}
            <div className="cart-shipping-notice">
              <span className="cart-shipping-notice__highlight">Free tracked delivery included</span>
            </div>

            {/* Error Notification if Cart/Checkout Fails (Requirement 11) */}
            {checkoutError && (
              <div className="cart-checkout-error" role="alert">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Proceed to Shopify Checkout Button */}
            <button
              type="button"
              className={`cart-checkout-btn${isCheckingOut ? ' cart-checkout-btn--loading' : ''}`}
              onClick={proceedToCheckout}
              disabled={isCheckingOut}
              aria-busy={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <span className="cart-spinner" aria-hidden="true"></span>
                  <span>REDIRECTING TO SHOPIFY CHECKOUT...</span>
                </>
              ) : (
                <>
                  <span>PROCEED TO SECURE CHECKOUT</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H5.25A2.25 2.25 0 003 12v7.5A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5V12a2.25 2.25 0 00-2.25-2.25h-1.5v-3A5.25 5.25 0 0012 1.5zm3.75 8.25v-3a3.75 3.75 0 00-7.5 0v3h7.5z" clipRule="evenodd"/>
                  </svg>
                </>
              )}
            </button>

            {/* Payment Badges */}
            <div className="cart-payment-badges" aria-label="Accepted payment methods">
              <img src="/pay-visa.png" alt="Visa" className="pay-badge-img" />
              <img src="/pay-mc.png" alt="Mastercard" className="pay-badge-img" />
              <img src="/pay-amex.png" alt="American Express" className="pay-badge-img" />
              <img src="/pay-applepay.png" alt="Apple Pay" className="pay-badge-img" />
              <img src="/pay-googlepay.png" alt="Google Pay" className="pay-badge-img" />
              <img src="/pay-paypal.png" alt="PayPal" className="pay-badge-img" />
              <img src="/pay-shop.png" alt="Shop Pay" className="pay-badge-img" />
            </div>

            {/* 30-Day Money-Back Guarantee */}
            <div className="cart-guarantee">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H5.25A2.25 2.25 0 003 12v7.5A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5V12a2.25 2.25 0 00-2.25-2.25h-1.5v-3A5.25 5.25 0 0012 1.5zm3.75 8.25v-3a3.75 3.75 0 00-7.5 0v3h7.5z" clipRule="evenodd"/>
              </svg>
              <span>30-Day Money-Back Guarantee</span>
            </div>

            {/* Continue Shopping Button */}
            <button
              type="button"
              className="cart-continue-btn"
              onClick={() => setIsOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
