import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { getShopifyShipping } from '../services/shopify';

export default function PolicyPage({ type = 'privacy' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const meta = {
    privacy: { title: 'Privacy Policy', key: 'privacyPolicy' },
    refund:  { title: 'Refund Policy',  key: 'refundPolicy' },
    terms:   { title: 'Terms of Service', key: 'termsOfService' },
  }[type] || { title: 'Store Policy', key: 'privacyPolicy' };

  useEffect(() => {
    document.title = `${meta.title} | GRIP GLOW`;
    window.scrollTo({ top: 0, behavior: 'instant' });

    let mounted = true;
    getShopifyShipping().then((res) => {
      if (!mounted) return;
      setData(res);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [type, meta.title]);

  const policy = data ? data[meta.key] : null;

  return (
    <>
      <main style={{ minHeight: '75vh', padding: '3.5rem 1rem 5rem' }}>
        <div className="container" style={{ maxWidth: 840, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '1.5rem',
            fontFamily: 'Oxanium, sans-serif'
          }}>
            {policy?.title || meta.title}
          </h1>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            lineHeight: 1.7,
            color: '#334155',
            fontSize: '0.95rem'
          }}>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading policy from Shopify...</p>
            ) : policy?.body ? (
              <div dangerouslySetInnerHTML={{ __html: policy.body }} />
            ) : (
              <div>
                <p>
                  At <strong>Grip Glow</strong>, we are committed to providing an exceptional and transparent customer experience.
                </p>
                {type === 'refund' && (
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '1.5rem 0 0.5rem' }}>
                      30-Day Risk-Free Money Back Guarantee
                    </h3>
                    <p>
                      We stand behind the quality of our Grip Glow lights. If you are not completely satisfied with your purchase for any reason, you may request a return within 30 days of receiving your item.
                    </p>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '1.5rem 0 0.5rem' }}>
                      How to Request a Return
                    </h3>
                    <p>
                      To initiate a return or exchange, simply email our customer support team at{' '}
                      <a href="mailto:contact@gripglow.com" style={{ color: '#496614', fontWeight: 600 }}>
                        contact@gripglow.com
                      </a>{' '}
                      with your order number. We will provide full return instructions and a prepaid return label if eligible.
                    </p>
                  </div>
                )}
                {type === 'terms' && (
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '1.5rem 0 0.5rem' }}>
                      General Terms
                    </h3>
                    <p>
                      By accessing or purchasing from Grip Glow, you agree to be bound by these terms. We reserve the right to update product offerings, pricing, and terms at any time.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
