import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FAQAccordion from '../components/FAQAccordion';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const PRODUCT = {
  id: 'gripglow-1',
  name: 'The Grip Glow',
  price: 87.00,
  img: '/product_image.jpg',
};

const FAQ_ITEMS = [
  {
    question: 'How powerful is the illumination?',
    answer: 'The Grip Glow delivers powerful wide-angle illumination across its full-length LED strip with multiple brightness modes — from a lower setting for close-up detail work to maximum output for large, dimly lit spaces like engine bays and wheel arches.',
  },
  {
    question: 'How long does the battery last on a full charge?',
    answer: 'Battery life varies by brightness mode. Lower settings extend run time significantly while maximum brightness reduces it. The light charges via USB-C with a built-in indicator. We recommend a full charge before first use.',
  },
  {
    question: 'How do I secure the light while working?',
    answer: 'Strong magnets on both rotating ends grip firmly to any ferrous metal surface — steel panels, frame rails, hood undersides, and chassis components. The 360-degree rotating ends let you angle the light precisely.',
  },
  {
    question: 'Is it restricted to magnetic surfaces only?',
    answer: 'Not at all. While magnets are the primary mounting method, the Grip Glow can also be placed on any flat surface, held by hand, or propped against a part. It works on aluminium, fibreglass, and other non-magnetic surfaces.',
  },
  {
    question: 'Will it melt plastic components if I leave it on in tight spaces?',
    answer: 'LED technology generates significantly less heat than halogen or incandescent bulbs. The Grip Glow is designed to remain cool during normal operation. As a precaution, avoid placing any light source directly against heat-sensitive materials for extended periods.',
  },
];

export default function HomePage() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'GRIP GLOW — Magnetic Rechargeable LED Work Lights';
  }, []);

  // Scroll-to-top button
  useEffect(() => {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;
    const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero" id="hero" aria-labelledby="hero-heading">
        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__content container">
          <div className="hero__inner">
            <div className="hero__rating" aria-label="4.9 out of 5 stars from over 16,684 customers">
              <span className="hero__stars" aria-hidden="true">★★★★★</span>
              <span>4.9/5 from 16,684+ Customers</span>
            </div>
            <h1 id="hero-heading" className="hero__heading">See Every Detail. Keep Hands<br />Free.</h1>
            <p className="hero__sub">Bright, adjustable lighting designed to help you see clearly through every task.</p>
            <a
              href="#product-section"
              className="btn btn-green btn-lg"
              id="hero-shop-btn"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop Now
            </a>
            <p className="hero__guarantee" aria-label="30-day money back guarantee">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" width="16" height="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              30-day money back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* ── PUBLICATIONS ── */}
      <section className="pubs" aria-label="As seen in publications">
        <div className="pubs__inner container">
          <span className="pubs__label">See us in</span>
          <div className="pubs__logos">
            <span className="pub-logo pub-autoweek">AutoWeek</span>
            <span className="pub-logo pub-motortrend">MOTORTREND</span>
            <span className="pub-logo pub-popmech">POPULAR<br/>MECHANICS</span>
            <span className="pub-logo pub-thedrive">THE<em>DRIVE</em></span>
          </div>
        </div>
      </section>

      {/* ── BEST SELLER ── */}
      <section className="products-sec" id="product-section" aria-labelledby="products-heading">
        <div className="container">
          <h2 id="products-heading" className="section-heading">Our Best Seller</h2>
          <div className="product-grid">
            <article
              className="pcard"
              id="product-card"
              aria-label="The Grip Glow product card"
              role="link"
              tabIndex={0}
              onClick={() => navigate('/products/flashlight')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/products/flashlight');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="pcard__img-wrap">
                <img src="/product_image.jpg" alt="The Grip Glow magnetic LED work light illuminating a car engine bay" className="pcard__img" loading="lazy" />
                <div className="pcard__img-overlay">
                  <span className="pcard__overlay-text">NO CORNER <span>LEFT UNLIT</span></span>
                </div>
                <div className="pcard__badges">
                  <span className="badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="12" height="12"><path d="M21 12a9 9 0 11-6-8.5"/><polyline points="21 3 21 9 15 9"/></svg>
                    360 Rotating Ends
                  </span>
                  <span className="badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="12" height="12"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/></svg>
                    Strong Magnets
                  </span>
                  <span className="badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="12" height="12"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                    Rechargeable Battery
                  </span>
                </div>
              </div>
              <div className="pcard__info">
                <h3 className="pcard__title">The Grip Glow</h3>
                <div className="pcard__prices">
                  <span className="pcard__price-current">$87.00 AUD</span>
                  <span className="pcard__price-original">$174.00 AUD</span>
                </div>
              </div>
              <button
                className="pcard__cta"
                id="view-product-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/products/flashlight');
                }}
              >
                View product
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="guarantee-banner" aria-labelledby="guarantee-heading">
        <div className="container">
          <h2 id="guarantee-heading">Our Satisfaction Guarantee</h2>
          <p>We stand behind every order. If you're not satisfied within 30 days, simply reach out to our customer support team. We'll make it right with a hassle-free replacement or a full refund.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-sec" id="faq" aria-labelledby="faq-heading">
        <div className="container">
          <h2 id="faq-heading" className="section-heading" style={{lineHeight:1.25}}>
            You've got questions?<br />We've got the answers.
          </h2>
          <FAQAccordion items={FAQ_ITEMS} />

          {/* Trust Benefits */}
          <div className="trust-row" style={{marginTop:'4rem'}}>
            <div className="trust-item">
              <div className="trust-item__icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="#E52B2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="20" width="32" height="22" rx="2"/><path d="M16 20V14a8 8 0 0116 0v6"/><circle cx="24" cy="31" r="2"/><line x1="24" y1="33" x2="24" y2="37"/>
                </svg>
              </div>
              <h3>Expedited Shipping</h3>
              <p>Customs and duties taxes included.</p>
            </div>
            <div className="trust-item">
              <div className="trust-item__icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="#E52B2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24 4L6 12v16c0 10 7.5 18 18 20 10.5-2 18-10 18-20V12L24 4z"/><polyline points="16 24 21 29 32 18"/>
                </svg>
              </div>
              <h3>Risk-Free Guarantee</h3>
              <p>Buy knowing your purchase comes with zero-risk returns.</p>
            </div>
            <div className="trust-item">
              <div className="trust-item__icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="#E52B2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="12" width="40" height="30" rx="3"/><path d="M4 20h40"/><line x1="12" y1="30" x2="24" y2="30"/><line x1="28" y1="30" x2="36" y2="30"/>
                </svg>
              </div>
              <h3>Secure payment</h3>
              <p>Payment info is encrypted and processed securely.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to top */}
      <button
        id="scroll-top-btn"
        className="scroll-top"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </>
  );
}
