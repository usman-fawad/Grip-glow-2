import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { CountdownProvider } from './context/CountdownContext';
import { CountryProvider } from './context/CountryContext';
import AnnouncementBar from './components/AnnouncementBar';
import Header          from './components/Header';
import CartDrawer      from './components/CartDrawer';
import HomePage        from './pages/HomePage';
import ProductPage     from './pages/ProductPage';
import TrackOrderPage  from './pages/TrackOrderPage';
import ContactPage     from './pages/ContactPage';
import AboutPage       from './pages/AboutPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import PolicyPage      from './pages/PolicyPage';
import './index.css';

function Layout() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <CartDrawer />
      <Routes>
        <Route path="/"                          element={<HomePage />} />
        {/* Product routes */}
        <Route path="/product"                   element={<ProductPage />} />
        <Route path="/products"                  element={<ProductPage />} />
        <Route path="/products/flashlight"       element={<ProductPage />} />
        <Route path="/magnetic-work-light"       element={<ProductPage />} />
        {/* Track Order routes */}
        <Route path="/track-order"               element={<TrackOrderPage />} />
        <Route path="/track"                     element={<TrackOrderPage />} />
        <Route path="/track-your-order"          element={<TrackOrderPage />} />
        <Route path="/pages/track-your-order"    element={<TrackOrderPage />} />
        {/* Contact routes */}
        <Route path="/contact"                   element={<ContactPage />} />
        <Route path="/contact-us"                element={<ContactPage />} />
        <Route path="/pages/contact"             element={<ContactPage />} />
        {/* About Us routes */}
        <Route path="/about"                     element={<AboutPage />} />
        <Route path="/about-us"                  element={<AboutPage />} />
        <Route path="/pages/about-us"            element={<AboutPage />} />
        {/* Shipping routes */}
        <Route path="/shipping"                  element={<ShippingPolicyPage />} />
        <Route path="/shipping-policy"           element={<ShippingPolicyPage />} />
        <Route path="/pages/shipping-policy"     element={<ShippingPolicyPage />} />
        <Route path="/delivery"                  element={<ShippingPolicyPage />} />
        {/* Policy routes */}
        <Route path="/privacy-policy"            element={<PolicyPage type="privacy" />} />
        <Route path="/pages/privacy-policy"      element={<PolicyPage type="privacy" />} />
        <Route path="/refund-policy"             element={<PolicyPage type="refund" />} />
        <Route path="/pages/refund-policy"       element={<PolicyPage type="refund" />} />
        <Route path="/terms-of-service"          element={<PolicyPage type="terms" />} />
        <Route path="/pages/terms-of-service"    element={<PolicyPage type="terms" />} />
        {/* Fallback 404 */}
        <Route path="*"                          element={
          <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
            <h1 style={{fontSize:'3rem',fontWeight:900,color:'#A8C34A'}}>404</h1>
            <p style={{color:'#a0a0a0'}}>Page not found.</p>
            <a href="/" style={{color:'#A8C34A',fontWeight:700,textDecoration:'underline'}}>← Back to Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CountryProvider>
          <CountdownProvider>
            <CartProvider>
              <Layout />
            </CartProvider>
          </CountdownProvider>
        </CountryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
