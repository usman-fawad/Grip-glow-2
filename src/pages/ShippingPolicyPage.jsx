import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import FAQAccordion from '../components/FAQAccordion';
import { useCountry } from '../context/CountryContext';
import { getShopifyShipping } from '../services/shopify';

export default function ShippingPolicyPage() {
  const { selectedCountry } = useCountry();
  const [shippingData, setShippingData] = useState(null);

  useEffect(() => {
    document.title = 'Shipping Process & Policy | GRIP GLOW';
    window.scrollTo({ top: 0, behavior: 'instant' });

    let mounted = true;
    getShopifyShipping().then((data) => {
      if (!mounted) return;
      setShippingData(data);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const process = shippingData?.process || {
    processingTime: '24 - 48 Hours',
    steps: [
      {
        step: 1,
        title: 'Order Processing',
        time: 'Within 24 Hours',
        description: 'Your order is securely received and forwarded to our fulfillment warehouse for picking and verification.',
      },
      {
        step: 2,
        title: 'Quality Check & Safe Packaging',
        time: 'Day 1 - 2',
        description: 'Each Grip Glow unit is tested, boxed with shock-absorbent cushioning, and prepared for dispatch.',
      },
      {
        step: 3,
        title: 'Dispatched with Live Tracking',
        time: 'Day 2',
        description: 'Your parcel is handed to the local express courier and an automated tracking link is sent via email and SMS.',
      },
      {
        step: 4,
        title: 'Doorstep Delivery & 30-Day Guarantee',
        time: '3 - 5 Days (UK) / 4 - 7 Days (Intl)',
        description: 'Safely delivered to your door. Backed by our 30-day money-back guarantee.',
      },
    ],
    countryEstimates: [
      { code: 'GBP', country: 'United Kingdom', estimate: '3 - 5 business days', cost: 'FREE', method: 'Tracked & Insured Delivery' },
      { code: 'USD', country: 'United States',  estimate: '4 - 7 business days', cost: 'FREE', method: 'USPS Tracked Shipping' },
      { code: 'AUD', country: 'Australia',      estimate: '5 - 8 business days', cost: 'FAST TRACKED', method: 'AusPost Tracked Shipping' },
      { code: 'EUR', country: 'Europe',         estimate: '4 - 7 business days', cost: 'FAST TRACKED', method: 'Priority Tracked Delivery' },
      { code: 'CAD', country: 'Canada',         estimate: '5 - 8 business days', cost: 'FAST TRACKED', method: 'Canada Post Tracked' },
      { code: 'NZD', country: 'New Zealand',    estimate: '5 - 9 business days', cost: 'FAST TRACKED', method: 'NZ Post Tracked' },
    ],
    faq: [
      {
        question: 'How long does order processing take?',
        answer: 'All orders are processed and inspected at our fulfillment center within 24 to 48 hours (excluding weekends and public holidays).'
      },
      {
        question: 'When will I receive my tracking number?',
        answer: 'You will automatically receive an email confirmation containing your live tracking code as soon as the courier scans your parcel at the dispatch facility.'
      },
      {
        question: 'Are customs, duties, and taxes included?',
        answer: 'Yes! All applicable customs duties and import taxes are prepaid and included. There are zero surprise fees upon delivery.'
      },
      {
        question: 'What if my package arrives damaged or delayed?',
        answer: 'Every shipment is 100% insured. If your package is delayed or damaged in transit, contact us at contact@gripglow.com and we will immediately issue a free replacement or full refund.'
      }
    ]
  };

  const shopifyPolicy = shippingData?.shippingPolicy;

  return (
    <>
      <main className="shipping-policy-page" style={{ minHeight: '80vh', padding: '3.5rem 1rem 5rem' }}>
        <div className="container" style={{ maxWidth: 960, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              background: '#f1f5e8',
              color: '#496614',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A8C34A' }} />
              Shopify Verified Shipping
            </span>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              marginBottom: '1rem',
              fontFamily: 'Oxanium, sans-serif'
            }}>
              Shipping & Delivery Process
            </h1>
            <p style={{ maxWidth: 620, margin: '0 auto', color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Every Grip Glow order is carefully inspected, packed, and dispatched with end-to-end tracked courier delivery.
            </p>
          </div>

          {/* 4-Step Shipping Journey */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#A8C34A" strokeWidth="2.5" width="24" height="24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              How Your Order Moves from Warehouse to Doorstep
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              position: 'relative'
            }}>
              {process.steps.map((st) => (
                <div
                  key={st.step}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #edf2f7',
                    borderRadius: 12,
                    padding: '1.5rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#A8C34A',
                      color: '#0f172a',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      marginBottom: '1rem'
                    }}>
                      {st.step}
                    </div>
                    <span style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#65a30d',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4
                    }}>
                      {st.time}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.3 }}>
                      {st.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                      {st.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Estimates Table */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '3rem'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  Country Delivery Estimates
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                  Showing transit times for supported shipping zones
                </p>
              </div>
              <div style={{
                background: '#f1f5e8',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#496614'
              }}>
                Current Country: {selectedCountry?.name || 'United Kingdom'}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px' }}>Destination</th>
                    <th style={{ padding: '12px 16px' }}>Estimated Delivery</th>
                    <th style={{ padding: '12px 16px' }}>Service</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {process.countryEstimates.map((c) => {
                    const isSelected = selectedCountry?.code === c.code;
                    return (
                      <tr
                        key={c.code}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#f8faf0' : 'transparent',
                          fontWeight: isSelected ? 700 : 500,
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '14px 16px', color: '#0f172a' }}>
                          {isSelected && <span style={{ color: '#65a30d', marginRight: 6 }}>●</span>}
                          {c.country}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>{c.estimate}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{c.method}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: '#496614', fontWeight: 800 }}>
                          {c.cost}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                Already placed an order? Track its journey in real-time:
              </span>
              <Link
                to="/track-order"
                className="btn btn-green"
                style={{ padding: '8px 20px', fontSize: '0.875rem' }}
              >
                Track Your Order →
              </Link>
            </div>
          </div>

          {/* Shopify Admin Policy Text (if configured in Shopify Admin) */}
          {shopifyPolicy?.body && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              marginBottom: '3rem'
            }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                {shopifyPolicy.title || 'Official Shopify Shipping Policy'}
              </h2>
              <div
                style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}
                dangerouslySetInnerHTML={{ __html: shopifyPolicy.body }}
              />
            </div>
          )}

          {/* FAQ Accordion */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Shipping Questions & Answers
            </h2>
            <FAQAccordion items={process.faq} />
          </div>

          {/* Support callout */}
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Need Help With Your Shipment?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
              Our dedicated support team is available 7 days a week. Reach out anytime with your order number.
            </p>
            <a
              href="mailto:contact@gripglow.com"
              className="btn btn-green"
              style={{ padding: '10px 24px' }}
            >
              Contact Shipping Support
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
