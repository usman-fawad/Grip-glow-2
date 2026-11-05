import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCountry } from '../context/CountryContext';

export default function Header() {
  const { totalQty, setIsOpen } = useCart();
  const { selectedCountry, setCountry, countries } = useCountry();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Close currency dropdown on click outside
  useEffect(() => {
    if (!currencyOpen) return;
    const onDocClick = (e) => {
      if (!e.target.closest('.header__currency')) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [currencyOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (window.innerWidth <= 900) {
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/products/flashlight', label: 'Magnetic Work Light' },
    { to: '/pages/track-your-order', label: 'Track Your Order' },
    { to: '/pages/contact', label: 'Contact' },
    { to: '/pages/about-us', label: 'About Us' },
  ];

  return (
    <>
      <header className="header">
        <div className="header__inner container">
          <NavLink to="/" className="logo" aria-label="GRIP GLOW home" onClick={() => setMenuOpen(false)}>
            <span className="logo-grip">GRIP </span><span className="logo-glow">GLOW</span>
          </NavLink>

          <nav className={`nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav__link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            {/* Currency Selector */}
            <div className="header__currency currency-sel">
              <button
                type="button"
                className="currency-sel__btn"
                aria-haspopup="listbox"
                aria-expanded={currencyOpen}
                aria-label="Select currency"
                onClick={() => setCurrencyOpen((o) => !o)}
              >
                <img
                  src={`https://flagcdn.com/w20/${selectedCountry.flag}.png`}
                  alt={`${selectedCountry.code} flag`}
                  width="18"
                  height="13"
                />
                <span className="currency-sel__code">{selectedCountry.code}</span>
                <svg className="currency-sel__chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
              <ul className={`currency-sel__drop${currencyOpen ? ' open' : ''}`} role="listbox" aria-label="Currencies">
                {countries.map((c) => (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={c.code === selectedCountry.code}
                    tabIndex={0}
                    className={c.code === selectedCountry.code ? 'selected' : ''}
                    onClick={() => {
                      setCountry(c);
                      setCurrencyOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setCountry(c);
                        setCurrencyOpen(false);
                      }
                    }}
                  >
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="cart-btn"
              id="cart-open-btn"
              aria-label={`Shopping cart, ${totalQty} item${totalQty !== 1 ? 's' : ''}`}
              onClick={() => {
                setMenuOpen(false);
                setIsOpen(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalQty > 0 && (
                <span className="cart-badge" aria-hidden="true">{totalQty}</span>
              )}
            </button>

            <button
              className={`hamburger${menuOpen ? ' is-active' : ''}`}
              id="hamburger-btn"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav backdrop */}
      <div
        className={`nav-backdrop${menuOpen ? ' open' : ''}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
    </>
  );
}
