import { useState, useEffect, useRef } from 'react';
import FAQAccordion from '../components/FAQAccordion';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useCountdown } from '../context/CountdownContext';
import { useCountry } from '../context/CountryContext';
import { getShopifyProduct, matchVariant } from '../services/shopify';

const BUNDLES = [
  { qty: 1, label: '1 Light',  price: 87.00,  orig: 174.00, tag: null,           disc: null },
  { qty: 2, label: '2 Lights', price: 174.00, orig: 348.00, tag: 'Most Popular', disc: '10% OFF' },
  { qty: 3, label: '3 Lights', price: 261.00, orig: 522.00, tag: 'Best Value',   disc: '15% OFF' },
];

const GALLERY = [
  { src: '/All colours Light for Work.png', alt: 'The Grip Glow Magnetic Work Light - All Colours' },
  { src: '/Gif.mp4', alt: 'The Grip Glow Magnetic Work Light - In Action Demo', isVideo: true },
  { src: '/Green Work Light.png', alt: 'The Grip Glow Magnetic Work Light - Green Edition', color: 'Green' },
  { src: '/work light 2.png', alt: 'The Grip Glow Magnetic Work Light - High-Power COB Light' },
  { src: '/work light 3.png', alt: 'The Grip Glow Magnetic Work Light - Dual 360° Magnetic Swivel Base' },
  { src: '/work light 4.png', alt: 'The Grip Glow Magnetic Work Light - Engine Bay Mount' },
  { src: '/work light 5.png', alt: 'The Grip Glow Magnetic Work Light - Under-Car & Chassis Mount' },
  { src: '/work light 6.png', alt: 'The Grip Glow Magnetic Work Light - USB-C Rechargeable Battery' },
  { src: '/work light 7.png', alt: 'The Grip Glow Magnetic Work Light - Rugged Water-Resistant Design' },
  { src: '/Red LED Work Light .png', alt: 'The Grip Glow Magnetic Work Light - Red Edition', color: 'Red' },
  { src: '/Yellow Work Light.png', alt: 'The Grip Glow Magnetic Work Light - Yellow Edition', color: 'Yellow' },
];

const COLOR_OPTIONS = [
  { name: 'Yellow', hex: '#FFE600', imgIndex: 10 },
  { name: 'Green', hex: '#74d600', imgIndex: 2 },
  { name: 'Red', hex: '#e52b2b', imgIndex: 9 },
];

const FAQ_ITEMS = [
  {
    question: 'How do I secure the light while working?',
    answer: 'Strong magnets on both 360-degree rotating ends grip firmly to any ferrous metal surface. Simply place it against a steel panel, hood underside, or chassis component and it locks into position. No clamps or helpers required.',
  },
  {
    question: 'Will it melt plastic components if I leave it on in tight spaces?',
    answer: 'LED technology generates significantly less heat than halogen or incandescent bulbs. The Grip Glow is designed to remain cool during normal operation, making it much safer around plastic covers, wiring, and rubber seals. As a precaution, avoid placing any light directly in contact with heat-sensitive materials for extended periods.',
  },
];

const FAVORITE_REVIEWS = [
  {
    id: 1,
    img: '/fav-tool-1.png',
    alt: 'Work light attached under car hood lighting the engine bay',
    title: '"Made car repairs so much easier for me"',
    text: '"I no longer need to call someone to hold the light while working under the hood. I just attach it in place and it lights the entire engine bay."',
    author: 'Daniel H.',
    badge: 'Verified Buyer',
  },
  {
    id: 2,
    img: '/fav-tool-2.png',
    alt: 'Dual red LED warning lights mounted on car tailgate',
    title: '"Saved me during a late-night breakdown"',
    text: '"Had a tire problem and I had to pull over in the middle of the night. The red light was really helpful. It kept me visible until I fixed my tire."',
    author: 'James T.',
    badge: 'Verified Buyer',
  },
  {
    id: 3,
    img: '/fav-tool-3.png',
    alt: 'Work light resting on ground illuminating floor space',
    title: '"The brightness is really impressive"',
    text: '"I was surprised by how much area this light covers. It lights up the space so well, it\'s amazing for when I work under the car."',
    author: 'John S.',
    badge: 'Verified Buyer',
  },
];

const REVIEW_BREAKDOWN = [
  { stars: 5, count: 338, percent: 99 },
  { stars: 4, count: 4, percent: 1 },
  { stars: 3, count: 0, percent: 0 },
  { stars: 2, count: 0, percent: 0 },
  { stars: 1, count: 0, percent: 0 },
];

function getDeliveryDates() {
  const today = new Date();
  const fmt = (d) => d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  const add = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  return { ordered: fmt(today), ready: fmt(add(1)), delivered: fmt(add(3)) };
}

export default function ProductPage() {
  const [activeImg, setActiveImg] = useState(0);
  const [activeBundle, setActiveBundle] = useState(0);
  const [bundleColors, setBundleColors] = useState(['Yellow', 'Green', 'Red']);
  const [added, setAdded] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [shopifyProduct, setShopifyProduct] = useState(null);
  const [shopifyVariants, setShopifyVariants] = useState([]);
  const thumbsRef = useRef(null);
  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const reviewTrackRef = useRef(null);
  const { addItem } = useCart();
  const { time } = useCountdown();
  const { selectedCountry } = useCountry();

  const scrollReviewToIndex = (index) => {
    const nextIdx = (index + FAVORITE_REVIEWS.length) % FAVORITE_REVIEWS.length;
    setActiveReview(nextIdx);
    const container = reviewTrackRef.current;
    if (container && container.children[nextIdx]) {
      const card = container.children[nextIdx];
      const targetLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  };

  const handlePrevReview = () => {
    const nextIdx = activeReview === 0 ? FAVORITE_REVIEWS.length - 1 : activeReview - 1;
    scrollReviewToIndex(nextIdx);
  };

  const handleNextReview = () => {
    const nextIdx = activeReview === FAVORITE_REVIEWS.length - 1 ? 0 : activeReview + 1;
    scrollReviewToIndex(nextIdx);
  };

  const handleReviewScroll = () => {
    const container = reviewTrackRef.current;
    if (!container || !container.children.length) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < container.children.length; i++) {
      const card = container.children[i];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const diff = Math.abs(center - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    if (closestIdx !== activeReview) {
      setActiveReview(closestIdx);
    }
  };

  useEffect(() => {
    document.title = 'The Grip Glow — Magnetic LED Work Light | GRIP GLOW';
  }, []);

  // Fetch product data and variant IDs from Shopify Storefront API
  useEffect(() => {
    let isMounted = true;
    getShopifyProduct()
      .then((product) => {
        if (!isMounted || !product) return;
        setShopifyProduct(product);
        if (product.variants?.nodes?.length > 0) {
          setShopifyVariants(product.variants.nodes);
          console.log('[Shopify] Synced product variants:', product.variants.nodes);
        }
      })
      .catch((err) => {
        console.warn('[Shopify] Could not fetch live product data:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize colour when active image changes to a colour edition
  useEffect(() => {
    const current = GALLERY[activeImg];
    if (current && current.color) {
      setBundleColors((prev) => {
        const next = [...prev];
        next[0] = current.color;
        return next;
      });
    }
  }, [activeImg]);

  const handleColorChange = (lightIndex, colorName) => {
    setBundleColors((prev) => {
      const next = [...prev];
      next[lightIndex] = colorName;
      return next;
    });

    const opt = COLOR_OPTIONS.find((c) => c.name === colorName);
    if (opt && opt.imgIndex !== undefined) {
      setActiveImg(opt.imgIndex);
    }
  };

  useEffect(() => {
    const v1 = videoRef.current;
    const v2 = reviewVideoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target instanceof HTMLMediaElement) {
            if (entry.isIntersecting) {
              entry.target.play().catch(() => {});
            } else {
              entry.target.pause();
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    if (v1) observer.observe(v1);
    if (v2) observer.observe(v2);
    return () => observer.disconnect();
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  };

  const handlePrev = () => {
    setActiveImg((prev) => (prev === 0 ? GALLERY.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImg((prev) => (prev === GALLERY.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const activeEl = container.children[activeImg];
    if (!activeEl) return;
    const targetLeft = activeEl.offsetLeft - (container.clientWidth - activeEl.offsetWidth) / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth'
    });
  }, [activeImg]);

  const handleAddToCart = () => {
    const b = BUNDLES[activeBundle];
    const colors = bundleColors.slice(0, b.qty);
    const colorStr = colors.join(' + ');
    const firstOpt = COLOR_OPTIONS.find((c) => c.name === colors[0]) || COLOR_OPTIONS[0];

    const variantText = b.qty === 1 ? `${colors[0]} · 1 Light` : `${colors.join(', ')} · ${b.label}`;

    // Map each light in the bundle to the corresponding Shopify variant ID
    const bundledLines = colors.map((col) => {
      const matched = matchVariant(shopifyVariants, col);
      return {
        color: col,
        shopifyVariantId: matched?.id || `gid://shopify/ProductVariant/fake-${col.toLowerCase()}`,
        qty: 1,
      };
    });

    const primaryVariant = matchVariant(shopifyVariants, colors[0]);
    const primaryShopifyId = primaryVariant?.id || `gid://shopify/ProductVariant/fake-${colors[0].toLowerCase()}`;

    // Price synchronization from Shopify variant if available
    let dynamicPrice = b.price;
    if (primaryVariant?.price?.amount) {
      const unit = parseFloat(primaryVariant.price.amount);
      if (b.qty === 1) dynamicPrice = unit;
      else if (b.qty === 2) dynamicPrice = +(unit * 2 * 0.9).toFixed(2);
      else if (b.qty === 3) dynamicPrice = +(unit * 3 * 0.85).toFixed(2);
    }

    addItem(
      {
        id: `gripglow-${b.qty}-${colors.map((c) => c.toLowerCase()).join('-')}`,
        shopifyVariantId: primaryShopifyId,
        bundledLines,
        name: `The Grip Glow (${colorStr}) ×${b.qty}`,
        title: shopifyProduct?.title || 'The Grip Glow Magnetic Work Light',
        variant: variantText,
        price: dynamicPrice,
        img: GALLERY[firstOpt.imgIndex].src,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // Determine delivery text based on selected country
  const deliveryHeadline =
    selectedCountry.code === 'GBP'
      ? 'FREE DELIVERY'
      : selectedCountry.code === 'USD'
      ? 'FREE SHIPPING'
      : selectedCountry.deliveryText;

  return (
    <>
      <main>
        <section className="product-page" aria-labelledby="product-heading">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a> › Magnetic Work Light
            </nav>

            <div className="product-page__grid">
              {/* ── LEFT: Gallery ── */}
              <div className="gallery">
                <div className="gallery__main" aria-roledescription="carousel" aria-label="Product Image Carousel">
                  <button
                    type="button"
                    className="gallery__nav-btn gallery__nav-btn--prev"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrev();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label="Previous image"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {GALLERY[activeImg].isVideo ? (
                    <video
                      key={GALLERY[activeImg].src}
                      src={GALLERY[activeImg].src}
                      className="gallery__main-img gallery__main-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-label={GALLERY[activeImg].alt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                    />
                  ) : (
                    <img
                      src={GALLERY[activeImg].src}
                      alt={GALLERY[activeImg].alt}
                      className="gallery__main-img"
                    />
                  )}

                  <button
                    type="button"
                    className="gallery__nav-btn gallery__nav-btn--next"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNext();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label="Next image"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <div className="gallery__thumbs" role="list" ref={thumbsRef}>
                  {GALLERY.map((img, i) => (
                    img.isVideo ? (
                      <div
                        key={i}
                        className="gallery__thumb-wrapper"
                        style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveImg(i);
                        }}
                      >
                        <video
                          src={img.src}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className={`gallery__thumb${activeImg === i ? ' active' : ''}`}
                          style={{ objectFit: 'cover' }}
                          role="listitem"
                          tabIndex={0}
                          aria-label={`View demonstration video ${i + 1}: ${img.alt}`}
                          aria-current={activeImg === i}
                          onMouseDown={(e) => e.preventDefault()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveImg(i);
                            }
                          }}
                        />
                        <span
                          className="gallery__thumb-badge"
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            bottom: 4,
                            right: 4,
                            background: 'rgba(0, 0, 0, 0.75)',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="#E52B2B" width="10" height="10">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </span>
                      </div>
                    ) : (
                      <img
                        key={i}
                        src={img.src}
                        alt={img.alt}
                        className={`gallery__thumb${activeImg === i ? ' active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveImg(i);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveImg(i);
                          }
                        }}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`View image ${i + 1}: ${img.alt}`}
                        aria-current={activeImg === i}
                      />
                    )
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Product Info ── */}
              <div className="pi">
                {/* Badge */}
                <div className="pi__badge-bar">
                  <span className="pi__badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="13" height="13">
                      <path d="M9 21h6"/><path d="M12 3C8.686 3 6 5.686 6 9c0 2.21 1.134 4.145 2.852 5.27.474.312.898.74 1.148 1.23V17h4v-1.5c.25-.49.674-.918 1.148-1.23C16.866 13.145 18 11.21 18 9c0-3.314-2.686-6-6-6z"/>
                    </svg>
                    The #1 Work Light for Every Task
                  </span>
                </div>

                {/* Rating */}
                <div className="pi__rating">
                  <span className="pi__stars" aria-hidden="true">★★★★★</span>
                  <span className="pi__rt">4.9 Excellent</span>
                  <span className="pi__rt">|</span>
                  <span className="pi__rt">16,684+ Customers</span>
                </div>

                {/* Product Title + Compact Countdown Row */}
                <div className="pi__title-row">
                  <h1 id="product-heading" className="pi__title">Magnetic Work Light</h1>

                </div>

                {/* Price Row (30% OFF) */}
                <div className="pi__price-row">
                  <span className="pi__price-cur">$87.00 AUD</span>
                  <span className="pi__price-orig">$174.00 AUD</span>
                  <span className="pi__sale-pill">SALE 30% OFF</span>
                </div>

                {/* Country-Based Delivery Text Badge */}
                <div className="pi__delivery-highlight" id="product-delivery-badge">
                  <div className="pi__delivery-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <div className="pi__delivery-content">
                    <span className="pi__delivery-headline">{deliveryHeadline}</span>
                    <span className="pi__delivery-destination">
                      to {selectedCountry.name} • Tracked & Insured
                    </span>
                  </div>
                </div>

                <p className="pi__desc">
                  Get bright, <span>hands-free lighting</span> wherever you need it, from car repairs to weekend projects.
                </p>

                {/* Colour Options: Yellow, Green, Red */}
                <div className="pi__color-selector" aria-label="Select product colour">
                  <div className="pi__color-header">
                    <span className="pi__color-label">Colour:</span>
                    <span className="pi__color-name">{bundleColors[0] || 'Yellow'}</span>
                  </div>
                  <div className="bundle-color-swatches" role="radiogroup" aria-label="Select colour">
                    {COLOR_OPTIONS.map((opt) => {
                      const isActive = (bundleColors[0] || 'Yellow') === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          className={`bundle-color-pill${isActive ? ' active' : ''}`}
                          onClick={() => handleColorChange(0, opt.name)}
                          aria-checked={isActive}
                          role="radio"
                          title={opt.name}
                        >
                          <span
                            className={`bundle-color-circle bundle-color-circle--${opt.name.toLowerCase()}`}
                            style={{ background: opt.hex }}
                          />
                          <span className="bundle-color-name">{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feature pills */}
                <div className="feature-grid" aria-label="Product features">
                  {[
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="13" height="13"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M4.93 4.93a10 10 0 000 14.14"/></svg>, label: 'COB Light' },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="13" height="13"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/></svg>, label: 'Magnetic Base' },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="13" height="13"><path d="M21 12a9 9 0 11-6-8.5"/><polyline points="21 3 21 9 15 9"/></svg>, label: '360° Rotation' },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="13" height="13"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>, label: 'USB-C Powered' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="feature-pill">
                      {icon}
                      {label}
                    </div>
                  ))}
                </div>

                {/* Bundle selector */}
                <p className="bundle-label">How Many Do You Need?</p>
                <div className="bundle-grid" role="group" aria-label="Bundle options">
                  {BUNDLES.map((b, i) => (
                    <div
                      key={i}
                      className={`bundle-card${activeBundle === i ? ' active' : ''}`}
                      onClick={() => setActiveBundle(i)}
                      onKeyDown={e => e.key === 'Enter' && setActiveBundle(i)}
                      tabIndex={0}
                      role="radio"
                      aria-checked={activeBundle === i}
                      aria-label={`${b.label}, $${b.price.toFixed(2)} AUD`}
                    >
                      {b.tag && <span className="bundle-card__tag">{b.tag}</span>}
                      <span className="bundle-card__num">{b.label}</span>
                      <span className="bundle-card__price">${b.price.toFixed(2)} AUD</span>
                      <span className="bundle-card__orig">${b.orig.toFixed(2)} AUD</span>
                      {b.disc && <span className="bundle-card__disc">{b.disc}</span>}
                    </div>
                  ))}
                </div>

                {/* ATC */}
                <button
                  className={`btn btn-green btn-full atc-btn`}
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  aria-live="polite"
                >
                  {added ? '✓ Added to Cart!' : `ADD TO CART — $${BUNDLES[activeBundle].price.toFixed(2)} AUD`}
                </button>

                <p className="guarantee-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="13" height="13">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  30-day money-back guarantee
                </p>

                {/* Payment methods */}
                <div className="pay-row product-pay-row" aria-label="Accepted payment methods">
                  <img src="/pay-visa.png" alt="Visa" className="pay-method-badge" />
                  <img src="/pay-mc.png" alt="Mastercard" className="pay-method-badge" />
                  <img src="/pay-amex.png" alt="American Express" className="pay-method-badge" />
                  <img src="/pay-applepay.png" alt="Apple Pay" className="pay-method-badge" />
                  <img src="/pay-googlepay.png" alt="Google Pay" className="pay-method-badge" />
                  <img src="/pay-paypal.png" alt="PayPal" className="pay-method-badge" />
                  <img src="/pay-shop.png" alt="Shop Pay" className="pay-method-badge" />
                </div>

                {/* Product Trust Badges */}
                <div className="product-trust-badges" aria-label="Product guarantees">
                  <div className="product-trust-badge">
                    <svg className="product-trust-badge__icon" viewBox="0 0 24 24" fill="none" stroke="#FF5426" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="1" y="4" width="14" height="12" rx="2" />
                      <path d="M15 8h4l3 3v5h-7V8z" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="17.5" cy="18.5" r="2.5" />
                    </svg>
                    <span className="product-trust-badge__text">Free UK Delivery</span>
                  </div>

                  <div className="product-trust-badge">
                    <svg className="product-trust-badge__icon" viewBox="0 0 24 24" fill="none" stroke="#FF5426" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="product-trust-badge__text">30-Day Returns</span>
                  </div>

                  <div className="product-trust-badge">
                    <svg className="product-trust-badge__icon" viewBox="0 0 24 24" fill="none" stroke="#FF5426" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
                      <path d="M12 6l-3.293 3.293a1 1 0 0 0 0 1.414l.586 .586a1 1 0 0 0 1.414 0l2.293 -2.293l2.293 2.293a1 1 0 0 0 1.414 0l.586 -.586a1 1 0 0 0 0 -1.414l-3.293 -3.293a1 1 0 0 0 -1.414 0z" />
                    </svg>
                    <span className="product-trust-badge__text">Trusted Quality</span>
                  </div>
                </div>

                {/* Review */}
                <div className="review-card">
                  <img src="/reviewer-garry.png" alt="Garry M." className="reviewer-av" width="36" height="36" />
                  <div className="review-card__info">
                    <p className="rname">Garry M. <span className="rbadge">| Verified Buyer</span></p>
                    <p className="review-card__stars" aria-label="5 stars">★★★★★</p>
                    <p className="review-card__text">
                      "Had to fix a few things under my hood and this light made the whole job so much easier. I attached it, adjusted the angle, and finally had a clear view of what I was working on."
                    </p>
                  </div>
                </div>

                {/* Product FAQ */}
                <FAQAccordion items={FAQ_ITEMS} />
              </div>
            </div>
          </div>
        </section>

        {/* ── THE RIGHT LIGHT FOR EVERY JOB ── */}
        <section className="job-light-sec" aria-labelledby="job-light-heading">
          <div className="container job-light__container">
            <div className="job-light__header">
              <h2 id="job-light-heading" className="job-light__heading">
                The Right Light For Every Job
              </h2>
              <div className="job-light__underline" aria-hidden="true" />
              <p className="job-light__sub">
                From garage repairs to outdoor tasks, get the visibility you need without slowing down.
              </p>
            </div>

            <div className="job-light__grid">
              {/* Left Column — two product benefits */}
              <div className="job-light__col job-light__col--left">
                <div className="job-benefit">
                  <div className="job-benefit__header">
                    <div className="job-benefit__icon" aria-hidden="true">
                      <svg viewBox="0 0 54 44" fill="none" stroke="#E52B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="46" height="38">
                        <line x1="12" y1="4" x2="12" y2="6" strokeWidth="2" />
                        <line x1="20" y1="3" x2="20" y2="5" strokeWidth="2" />
                        <line x1="27" y1="2" x2="27" y2="5" strokeWidth="2" />
                        <line x1="34" y1="3" x2="34" y2="5" strokeWidth="2" />
                        <line x1="42" y1="4" x2="42" y2="6" strokeWidth="2" />
                        <rect x="8" y="9" width="38" height="26" rx="4" stroke="#E52B2B" strokeWidth="2" />
                        <circle cx="16" cy="18" r="1.5" fill="#E52B2B" />
                        <circle cx="23" cy="18" r="1.5" fill="#E52B2B" />
                        <circle cx="31" cy="18" r="1.5" fill="#E52B2B" />
                        <circle cx="38" cy="18" r="1.5" fill="#E52B2B" />
                        <circle cx="16" cy="26" r="1.5" fill="#E52B2B" />
                        <circle cx="23" cy="26" r="1.5" fill="#E52B2B" />
                        <circle cx="31" cy="26" r="1.5" fill="#E52B2B" />
                        <circle cx="38" cy="26" r="1.5" fill="#E52B2B" />
                        <line x1="3" y1="22" x2="5" y2="22" strokeWidth="2" />
                        <line x1="49" y1="22" x2="51" y2="22" strokeWidth="2" />
                        <line x1="16" y1="39" x2="16" y2="41" strokeWidth="2" />
                        <line x1="27" y1="39" x2="27" y2="42" strokeWidth="2" />
                        <line x1="38" y1="39" x2="38" y2="41" strokeWidth="2" />
                      </svg>
                    </div>
                    <h3 className="job-benefit__title">COB LED Light</h3>
                  </div>
                  <p className="job-benefit__desc">
                    Wide, bright lighting that helps you see every detail while working.
                  </p>
                </div>

                <div className="job-benefit">
                  <div className="job-benefit__header">
                    <div className="job-benefit__icon" aria-hidden="true">
                      <svg viewBox="0 0 54 44" fill="none" stroke="#E52B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="46" height="38">
                        <rect x="6" y="8" width="42" height="28" rx="5" stroke="#E52B2B" strokeWidth="2.2" />
                        <line x1="14" y1="22" x2="22" y2="22" strokeWidth="2.5" stroke="#E52B2B" />
                        <line x1="28" y1="22" x2="34" y2="22" strokeWidth="2.5" stroke="#E52B2B" />
                        <circle cx="39" cy="15" r="1.5" fill="#E52B2B" />
                        <line x1="14" y1="15" x2="26" y2="15" strokeWidth="1.8" stroke="#E52B2B" />
                      </svg>
                    </div>
                    <h3 className="job-benefit__title">Digital Battery Display</h3>
                  </div>
                  <p className="job-benefit__desc">
                    Real-time battery information helps you avoid unexpected downtime.
                  </p>
                </div>
              </div>

              {/* Center Column — uploaded video */}
              <div className="job-light__video-col">
                <div className="job-light__video-wrap">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="job-light__video"
                    aria-label="Demonstration video of The Grip Glow magnetic work light"
                    onClick={toggleVideo}
                  >
                    <source src="/305e7434475149fdb464665a0df2907f.HD-1080p-2.5Mbps-95890083.mp4" type="video/mp4" />
                    <source src="/Video review.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Right Column — two product benefits */}
              <div className="job-light__col job-light__col--right">
                <div className="job-benefit">
                  <div className="job-benefit__header">
                    <div className="job-benefit__icon" aria-hidden="true">
                      <svg viewBox="0 0 48 48" fill="none" stroke="#E52B2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
                        <circle cx="24" cy="24" r="20" stroke="#E52B2B" strokeWidth="2.2" strokeDasharray="30 8 30 8" />
                        <path d="M21 4L24 1L27 4" stroke="#E52B2B" strokeWidth="2.2" />
                        <path d="M27 44L24 47L21 44" stroke="#E52B2B" strokeWidth="2.2" />
                        <text x="24" y="29" fill="#E52B2B" fontSize="13" fontWeight="900" fontFamily="Poppins, sans-serif" textAnchor="middle" stroke="none">360°</text>
                      </svg>
                    </div>
                    <h3 className="job-benefit__title">360° Rotating Design</h3>
                  </div>
                  <p className="job-benefit__desc">
                    Adjust the angle to direct light exactly where you need it.
                  </p>
                </div>

                <div className="job-benefit">
                  <div className="job-benefit__header">
                    <div className="job-benefit__icon" aria-hidden="true">
                      <svg viewBox="0 0 48 48" fill="none" stroke="#E52B2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
                        <circle cx="24" cy="24" r="20" stroke="#E52B2B" strokeWidth="2.2" />
                        <line x1="18" y1="15" x2="18" y2="19" strokeWidth="2.4" />
                        <line x1="30" y1="15" x2="30" y2="19" strokeWidth="2.4" />
                        <rect x="15" y="19" width="18" height="11" rx="3" strokeWidth="2.2" />
                        <line x1="24" y1="30" x2="24" y2="34" strokeWidth="2.4" />
                        <line x1="10" y1="38" x2="38" y2="10" stroke="#E52B2B" strokeWidth="2.5" />
                      </svg>
                    </div>
                    <h3 className="job-benefit__title">Cordless Use</h3>
                  </div>
                  <p className="job-benefit__desc">
                    No need to keep it plugged in thanks to the built-in rechargeable battery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MORE THAN JUST A WORK LIGHT ── */}
        <section className="more-than-sec" aria-labelledby="more-than-heading">
          <div className="container more-than-container">
            <div className="more-than-grid">
              <div className="more-than-content">
                <h2 id="more-than-heading" className="more-than-heading">
                  More Than Just A <span className="highlight-green">Work Light</span>
                </h2>
                <p className="more-than-sub">
                  Make your tasks easier with our <strong>bright, hands-free</strong> lamp designed for real-world jobs.
                </p>

                <div className="more-than-features">
                  <div className="more-than-feature">
                    <div className="more-than-feature__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
                        <path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/>
                        <path d="m5 8 4 4"/>
                        <path d="m12 15 4 4"/>
                      </svg>
                    </div>
                    <div className="more-than-feature__info">
                      <h3 className="more-than-feature__title">Magnetic Base</h3>
                      <p className="more-than-feature__desc">
                        Secure the light on metal surfaces and keep it positioned exactly where you need it.
                      </p>
                    </div>
                  </div>

                  <div className="more-than-feature">
                    <div className="more-than-feature__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2"/>
                        <path d="M12 20v2"/>
                        <path d="m4.93 4.93 1.41 1.41"/>
                        <path d="m17.66 17.66 1.41 1.41"/>
                        <path d="M2 12h2"/>
                        <path d="M20 12h2"/>
                        <path d="m6.34 17.66-1.41 1.41"/>
                        <path d="m19.07 4.93-1.41 1.41"/>
                      </svg>
                    </div>
                    <div className="more-than-feature__info">
                      <h3 className="more-than-feature__title">Dual Lighting Modes</h3>
                      <p className="more-than-feature__desc">
                        Switch between a <strong>COB light</strong> for detailed repairs and a <strong>red warning mode</strong> for emergencies.
                      </p>
                    </div>
                  </div>

                  <div className="more-than-feature">
                    <div className="more-than-feature__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
                        <circle cx="12" cy="12" r="10"/>
                        <rect x="8" y="7" width="8" height="10" rx="1.5"/>
                        <path d="M11 5h2"/>
                        <path d="m12.5 9-1.5 2.5h2L11.5 14"/>
                      </svg>
                    </div>
                    <div className="more-than-feature__info">
                      <h3 className="more-than-feature__title">Rechargeable Power</h3>
                      <p className="more-than-feature__desc">
                        Convenient <strong>USB-C charging</strong> to keep your light ready without relying on disposable batteries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="more-than-video-col">
                <div className="more-than-video-wrap">
                  <video
                    ref={reviewVideoRef}
                    src="/review2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="more-than-video"
                    aria-label="Demonstration of the work light in action"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FROM FIRST USE TO FAVORITE TOOL ── */}
        <section className="favorite-tool-sec" aria-labelledby="favorite-tool-heading">
          <div className="container favorite-tool-container">
            <div className="favorite-tool-header">
              <h2 id="favorite-tool-heading" className="favorite-tool-heading">
                From First Use To <span className="favorite-tool-highlight">
                  Favorite Tool
                  <svg className="favorite-tool-brush" viewBox="0 0 160 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 8C45 3.5 105 2.5 157 6.5C115 10 50 11 3 8Z" fill="#9ecb2a" opacity="0.85"/>
                  </svg>
                </span>
              </h2>
            </div>

            <div className="favorite-tool-slider-wrap">
              {/* Prev Button */}
              <button
                type="button"
                className="favorite-tool-nav-btn favorite-tool-nav-btn--prev"
                onClick={handlePrevReview}
                aria-label="Previous review"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Cards Track */}
              <div
                className="favorite-tool-grid"
                ref={reviewTrackRef}
                onScroll={handleReviewScroll}
              >
                {FAVORITE_REVIEWS.map((r, idx) => (
                  <div
                    key={r.id}
                    className={`favorite-tool-card${activeReview === idx ? ' is-active' : ''}`}
                    onClick={() => scrollReviewToIndex(idx)}
                  >
                    <div className="favorite-tool-card__img-wrap">
                      <img
                        src={r.img}
                        alt={r.alt}
                        className="favorite-tool-card__img"
                        loading="lazy"
                      />
                      <div className="favorite-tool-card__quote-badge" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>
                    <div className="favorite-tool-card__body">
                      <div className="favorite-tool-card__stars" aria-label="5 out of 5 stars">
                        <span aria-hidden="true">★★★★★</span>
                      </div>
                      <h3 className="favorite-tool-card__title">
                        {r.title}
                      </h3>
                      <p className="favorite-tool-card__text">
                        {r.text}
                      </p>
                      <p className="favorite-tool-card__author">
                        <em>{r.author}</em> <span className="favorite-tool-card__badge">| {r.badge}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                className="favorite-tool-nav-btn favorite-tool-nav-btn--next"
                onClick={handleNextReview}
                aria-label="Next review"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="favorite-tool-dots" role="tablist" aria-label="Review slider pagination">
              {FAVORITE_REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`favorite-tool-dot${activeReview === idx ? ' active' : ''}`}
                  onClick={() => scrollReviewToIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  aria-current={activeReview === idx}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── THE RESULTS SPEAK FOR THEMSELVES ── */}
        <section className="results-speak-sec" aria-labelledby="results-speak-heading">
          <div className="container results-speak-container">
            <div className="results-speak-grid">
              {/* Left: Product in Action Photo */}
              <div className="results-speak-img-wrap">
                <img
                  src="/results-wheel.png"
                  alt="Magnetic work light attached to car wheel arch"
                  className="results-speak-img"
                  loading="lazy"
                />
              </div>

              {/* Right: Content */}
              <div className="results-speak-content">
                <h2 id="results-speak-heading" className="results-speak-heading">
                  The <span className="highlight-green">Results</span> Speak For Themselves
                </h2>
                <p className="results-speak-sub">
                  Join thousands of customers who made everyday tasks easier with reliable lighting:
                </p>

                <div className="results-speak-stats">
                  <div className="results-speak-stat">
                    <div className="results-speak-circle" aria-hidden="true">
                      <span>96%</span>
                    </div>
                    <p className="results-speak-stat-text">
                      reported the lamp delivered reliable lighting even in <strong>hard-to-reach areas</strong>.
                    </p>
                  </div>

                  <div className="results-speak-stat">
                    <div className="results-speak-circle" aria-hidden="true">
                      <span>98%</span>
                    </div>
                    <p className="results-speak-stat-text">
                      appreciated having a reliable light that stayed ready through <strong>multiple uses</strong> before needing a power boost.
                    </p>
                  </div>

                  <div className="results-speak-stat">
                    <div className="results-speak-circle" aria-hidden="true">
                      <span>94%</span>
                    </div>
                    <p className="results-speak-stat-text">
                      found it easier to position their light with the hooks and magnets <strong>exactly where they needed it</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CUSTOMER REVIEWS & RATINGS SECTION ── */}
        <section className="cust-reviews-sec" aria-labelledby="cust-reviews-heading">
          <div className="container cust-reviews-container">
            {/* Top Rating Summary Bar */}
            <div className="cust-reviews-header">
              {/* Left: Score */}
              <div className="cust-reviews-score-col">
                <div className="cust-reviews-big-score">5.0</div>
                <div className="cust-reviews-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <div className="cust-reviews-count">342 reviews</div>
              </div>

              {/* Middle: Bars */}
              <div className="cust-reviews-bars-col" aria-label="Rating distribution">
                {REVIEW_BREAKDOWN.map((b) => (
                  <div key={b.stars} className="cust-reviews-bar-row">
                    <span className="cust-reviews-bar-label">{b.stars} ★</span>
                    <div className="cust-reviews-bar-track">
                      <div
                        className="cust-reviews-bar-fill"
                        style={{ width: `${b.percent}%` }}
                      />
                    </div>
                    <span className="cust-reviews-bar-count">({b.count})</span>
                  </div>
                ))}
              </div>

              {/* Right: Write Review Call to Action */}
              <div className="cust-reviews-cta-col">
                <h3 className="cust-reviews-cta-title">Share your experience</h3>
                <div className="cust-reviews-cta-stars" aria-hidden="true">★★★★★</div>
                <button
                  type="button"
                  className="btn-write-review"
                  onClick={() => setShowReviewModal(true)}
                  id="write-review-btn"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* Reviews Cards Grid */}
            <div className="cust-reviews-grid">
              {/* Card 1: Mateo Johnson (with photo) */}
              <div className="cust-review-card cust-review-card--photo">
                <img
                  src="/review-mateo.png"
                  alt="Mateo Johnson car engine repair with work light"
                  className="cust-review-card__photo"
                  loading="lazy"
                />
                <div className="cust-review-card__body">
                  <h4 className="cust-review-card__name">Mateo Johnson</h4>
                  <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                  <div className="cust-review-card__date">Aug 4, 2026</div>
                  <p className="cust-review-card__text">
                    Used this while working on my car and it made seeing into darker areas much easier. Simple and does what I needed
                  </p>
                </div>
              </div>

              {/* Card 2: Tyler Gomez (with photo) */}
              <div className="cust-review-card cust-review-card--photo">
                <img
                  src="/review-tyler.png"
                  alt="Tyler Gomez holding work light switch"
                  className="cust-review-card__photo"
                  loading="lazy"
                />
                <div className="cust-review-card__body">
                  <h4 className="cust-review-card__name">Tyler Gomez</h4>
                  <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                  <div className="cust-review-card__date">Aug 3, 2026</div>
                  <p className="cust-review-card__text">
                    The light output is great. I was tired of using my phone flashlight for jobs around the garage.
                  </p>
                </div>
              </div>

              {/* Card 3: James Myers (with photo) */}
              <div className="cust-review-card cust-review-card--photo">
                <img
                  src="/review-james.png"
                  alt="James Myers work light mounted on hood"
                  className="cust-review-card__photo"
                  loading="lazy"
                />
                <div className="cust-review-card__body">
                  <h4 className="cust-review-card__name">James Myers</h4>
                  <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                  <div className="cust-review-card__date">Aug 2, 2026</div>
                  <p className="cust-review-card__text">
                    I like the rotating ends on this. Makes positioning the light much easier depending on where I'm working.
                  </p>
                </div>
              </div>

              {/* Column 4: Marcus Turner (top) & Fabian Torres (bottom) */}
              <div className="cust-review-stacked-col">
                <div className="cust-review-card cust-review-card--text">
                  <div className="cust-review-card__body">
                    <h4 className="cust-review-card__name">Marcus Turner</h4>
                    <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                    <div className="cust-review-card__date">Aug 4, 2026</div>
                    <p className="cust-review-card__text">
                      The light is brighter than I expected and feels solid in the hand. I keep it in my garage and it's been handy for small projects.
                    </p>
                  </div>
                </div>
                <div className="cust-review-card cust-review-card--text">
                  <div className="cust-review-card__body">
                    <h4 className="cust-review-card__name">Fabian Torres</h4>
                    <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                    <div className="cust-review-card__date">Aug 3, 2026</div>
                    <p className="cust-review-card__text">
                      bought this for my toolbox and it's already come in handy a few times. The rechargeable feature is convenient.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 5: Atlas Castillo (top) & Fabian Anderson (bottom) */}
              <div className="cust-review-stacked-col">
                <div className="cust-review-card cust-review-card--text">
                  <div className="cust-review-card__body">
                    <h4 className="cust-review-card__name">Atlas Castillo</h4>
                    <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                    <div className="cust-review-card__date">Aug 4, 2026</div>
                    <p className="cust-review-card__text">
                      Really useful little work light. The magnets make it easy to place where I need it instead of holding it the whole time.
                    </p>
                  </div>
                </div>
                <div className="cust-review-card cust-review-card--text">
                  <div className="cust-review-card__body">
                    <h4 className="cust-review-card__name">Fabian Anderson</h4>
                    <div className="cust-review-card__stars" aria-label="5 stars">★★★★★</div>
                    <div className="cust-review-card__date">Aug 4, 2026</div>
                    <p className="cust-review-card__text">
                      Nice build quality and I like that I can adjust the angle. It feels like something I'll actually use often.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Write a Review Modal */}
          {showReviewModal && (
            <div className="review-modal-backdrop" onClick={() => setShowReviewModal(false)}>
              <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="review-modal-close"
                  onClick={() => setShowReviewModal(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
                <h3 className="review-modal-title">Write a Review</h3>
                <p className="review-modal-sub">Share your feedback about The Grip Glow Magnetic Work Light</p>

                {reviewSubmitted ? (
                  <div className="review-modal-success">
                    <div className="review-modal-success-icon">✓</div>
                    <h4>Thank you for your review!</h4>
                    <p>Your review has been submitted and will appear shortly.</p>
                    <button
                      type="button"
                      className="btn btn-green"
                      onClick={() => {
                        setReviewSubmitted(false);
                        setShowReviewModal(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setReviewSubmitted(true);
                    }}
                    className="review-modal-form"
                  >
                    <div className="review-form-group">
                      <label htmlFor="review-author">Your Name</label>
                      <input
                        id="review-author"
                        type="text"
                        required
                        placeholder="e.g. Alex M."
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        className="review-form-input"
                      />
                    </div>
                    <div className="review-form-group">
                      <label>Rating</label>
                      <div className="review-form-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`review-form-star-btn${star <= newReviewRating ? ' active' : ''}`}
                            onClick={() => setNewReviewRating(star)}
                            aria-label={`Rate ${star} star`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="review-form-group">
                      <label htmlFor="review-text">Your Review</label>
                      <textarea
                        id="review-text"
                        required
                        rows="4"
                        placeholder="How did you use the light? What did you like most?"
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        className="review-form-textarea"
                      />
                    </div>
                    <button type="submit" className="btn btn-green btn-full">
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
