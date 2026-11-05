import { useState } from 'react';
import { Link } from 'react-router-dom';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setSuccess('Thanks for subscribing! Check your inbox for a confirmation.');
    setEmail('');
    setTimeout(() => setSuccess(''), 6000);
  };

  return (
    <form className="nl-form" onSubmit={submit} noValidate aria-label="Email newsletter signup">
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <input
        id="nl-email"
        type="email"
        className={`nl-input${error ? ' invalid' : ''}`}
        placeholder="Email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(''); }}
        autoComplete="email"
      />
      <div className="nl-error" role="alert" aria-live="polite">{error}</div>
      <button type="submit" className="nl-btn">Sign up</button>
      <div className="nl-success" role="status" aria-live="polite">{success}</div>
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__col">
            <Link to="/" className="footer__logo" aria-label="GRIP GLOW home">
              <span className="footer__logo-badge">
                <span className="logo-grip">GRIP&nbsp;</span><span className="logo-glow">GLOW</span>
              </span>
            </Link>
          </div>

          {/* Quick links */}
          <div className="footer__col">
            <h4>Quick links</h4>
            <ul className="footer__links">
              {['Privacy Policy','Refund Policy','Shipping Policy','Terms of Service'].map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer__col">
            <h4>Subscribe to our emails</h4>
            <p className="footer__nl-desc">Subscribe to our newsletter for updates, exclusive offers, and more!</p>
            <NewsletterForm />
          </div>

          {/* Support */}
          <div className="footer__col">
            <h4>We're here to help</h4>
            <p className="footer__support-desc">For questions or assistance, contact us by phone or email. We respond promptly to resolve any concerns. Your satisfaction is our priority!</p>
            <a href="mailto:contact@gripglow.com" className="footer__email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              contact@gripglow.com
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <div className="pay-row" aria-label="Accepted payment methods">
            <img src="/pay-visa.png" alt="Visa" className="pay-method-badge" />
            <img src="/pay-mc.png" alt="Mastercard" className="pay-method-badge" />
            <img src="/pay-amex.png" alt="American Express" className="pay-method-badge" />
            <img src="/pay-applepay.png" alt="Apple Pay" className="pay-method-badge" />
            <img src="/pay-googlepay.png" alt="Google Pay" className="pay-method-badge" />
            <img src="/pay-paypal.png" alt="PayPal" className="pay-method-badge" />
            <img src="/pay-shop.png" alt="Shop Pay" className="pay-method-badge" />
          </div>
          <p className="footer__copyright">© 2026, Grip Glow</p>
        </div>
      </div>
    </footer>
  );
}
