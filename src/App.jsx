import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Menu as MenuIcon, 
  X, 
  Truck, 
  Store, 
  Tag, 
  Check, 
  Plus, 
  Minus, 
  ChevronRight,
  MapPin,
  Sprout,
  ShieldCheck,
  Clock,
  Utensils,
  Award
} from 'lucide-react';
import { MENU_ITEMS } from './data/menu';

function App() {
  // --- State Hooks ---
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modals / Drawer toggles
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Auth simulation
  const [userEmail, setUserEmail] = useState('');
  const [signinFormVal, setSigninFormVal] = useState({ email: '', password: '' });
  
  // Options
  const [isDelivery, setIsDelivery] = useState(true);
  
  // Order Tracking simulation
  const [trackingInput, setTrackingInput] = useState('');
  const [showTracker, setShowTracker] = useState(false);
  const [trackingState, setTrackingState] = useState({
    orderId: '123456',
    step: 1, // 0: Placed, 1: Preparing, 2: On The Way, 3: Delivered
    eta: '20 mins',
    statusText: 'Preparing'
  });
  
  const [lastReceipt, setLastReceipt] = useState({
    orderId: '123456',
    eta: '30 mins',
    totalCharged: '$0.00'
  });

  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
  const menuSectionRef = useRef(null);
  const offersSectionRef = useRef(null);

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsNavbarScrolled(true);
      } else {
        setIsNavbarScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Cart Calculations ---
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  let discount = 0;
  let deliveryFee = isDelivery ? 2.00 : 0;

  if (appliedCoupon === 'SOUTH20') {
    discount = subtotal * 0.20;
  } else if (appliedCoupon === 'FASTFREE') {
    deliveryFee = 0;
  } else if (appliedCoupon === 'SWEET10') {
    discount = subtotal * 0.10;
  }

  const tax = subtotal * 0.05;
  const grandTotal = Math.max(0, (subtotal - discount) + deliveryFee + tax);

  // --- Methods ---
  const handleAddToCart = (dishId) => {
    const dish = MENU_ITEMS.find(item => item.id === dishId);
    if (!dish) return;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === dishId);
      if (existing) {
        return prevCart.map(item => 
          item.id === dishId ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prevCart, { ...dish, qty: 1 }];
      }
    });
  };

  const handleUpdateQty = (dishId, delta) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === dishId);
      if (!item) return prevCart;
      
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prevCart.filter(i => i.id !== dishId);
      } else {
        return prevCart.map(i => 
          i.id === dishId ? { ...i, qty: newQty } : i
        );
      }
    });
  };

  const handleRemoveCartItem = (dishId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== dishId));
  };

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    const code = couponInput.toUpperCase().trim();
    if (code === 'SOUTH20' || code === 'FASTFREE' || code === 'SWEET10') {
      setAppliedCoupon(code);
      setIsCartOpen(true);
    } else {
      alert('Invalid coupon code. Try using SOUTH20, FASTFREE, or SWEET10!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    const totalChargedText = `$${grandTotal.toFixed(2)}`;

    const newReceipt = {
      orderId: randomId,
      eta: isDelivery ? '30 Mins' : '15 Mins',
      totalCharged: totalChargedText
    };

    setLastReceipt(newReceipt);
    setTrackingState({
      orderId: randomId,
      step: 0, // Placed
      eta: newReceipt.eta,
      statusText: 'Placed'
    });

    setIsCartOpen(false);
    setIsSuccessOpen(true);
    setCart([]);
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const enteredId = trackingInput.trim();
    if (enteredId.length < 5) {
      alert('Please enter a valid Order ID');
      return;
    }

    if (enteredId === '123456') {
      setTrackingState({
        orderId: '123456',
        step: 1, // Preparing
        eta: '18 Mins',
        statusText: 'Preparing'
      });
    } else if (enteredId !== trackingState.orderId) {
      setTrackingState({
        orderId: enteredId,
        step: 0,
        eta: '25 Mins',
        statusText: 'Placed'
      });
    }

    setShowTracker(true);
  };

  const handleSimulateNextStep = () => {
    if (trackingState.step < 3) {
      const nextStep = trackingState.step + 1;
      const statuses = ['Placed', 'Preparing', 'On The Way', 'Delivered'];
      let nextEta = trackingState.eta;
      if (nextStep === 2) nextEta = '8 Mins';
      if (nextStep === 3) nextEta = 'Arrived!';

      setTrackingState(prev => ({
        ...prev,
        step: nextStep,
        eta: nextEta,
        statusText: statuses[nextStep]
      }));
    } else {
      alert('Your order is already delivered! Enjoy your authentic meal.');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setUserEmail(signinFormVal.email);
    setIsSignInOpen(false);
    alert(`Successfully logged in as ${signinFormVal.email}!`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Auto scroll to menu on first keypress if not visible
    if (menuSectionRef.current && window.scrollY < 200) {
      menuSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Filtering ---
  let filteredMenu = MENU_ITEMS;
  if (selectedCategory !== 'all') {
    filteredMenu = filteredMenu.filter(item => item.category === selectedCategory);
  }
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filteredMenu = filteredMenu.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q)
    );
  }

  // Float card helper actions
  const triggerDelivery = () => {
    setIsDelivery(true);
    setIsCartOpen(true);
    alert('Delivery mode active. A standard $2.00 delivery fee applies.');
  };

  const triggerPickup = () => {
    setIsDelivery(false);
    setIsCartOpen(true);
    alert('Self Pickup mode active. Delivery fee waived.');
  };

  const triggerOffersScroll = () => {
    if (offersSectionRef.current) {
      offersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      
      {/* Top Navigation Bar */}
      <nav className={`navbar ${isNavbarScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-container">
          <a href="#" className="logo-brand-container">
            <img src="/logo.png" alt="IEYAL Logo" className="navbar-logo-img" />
            <span className="logo-brand-text">IEYAL</span>
          </a>
          <div className="nav-actions">
            <button 
              className="nav-btn sign-in-btn" 
              onClick={() => window.location.href = 'https://ownbites.netlify.app/'}
            >
              SIGN IN
            </button>


            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Toggle mobile menu"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div 
        className={`mobile-nav-overlay ${isMobileNavOpen ? 'active' : ''}`}
        onClick={() => setIsMobileNavOpen(false)}
      ></div>
      <div className={`mobile-nav-drawer ${isMobileNavOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <a href="#" className="logo-brand-container">
            <img src="/logo.png" alt="IEYAL Logo" className="navbar-logo-img" />
            <span className="logo-brand-text">IEYAL</span>
          </a>
          <button className="close-btn" onClick={() => setIsMobileNavOpen(false)}>&times;</button>
        </div>
        <div className="drawer-links">
          <a href="#menu-section" className="drawer-link" onClick={() => setIsMobileNavOpen(false)}>MENU</a>
          <a href="#offers-section" className="drawer-link" onClick={() => setIsMobileNavOpen(false)}>OFFERS</a>
          <button 
            className="drawer-signin-btn" 
            onClick={() => {
              setIsMobileNavOpen(false);
              window.location.href = 'https://ownbites.netlify.app/';
            }}
          >
            SIGN IN
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-container">
          {/* Left Column */}
          <div className="hero-content">
            <h1 className="hero-title">
              FRESH AUTHENTIC<br />
              <span className="accent-text">SOUTH INDIAN</span><br />
              FLAVOURS
            </h1>
            <p className="hero-highlight">
              Premium Quality &bull; Fast Delivery &bull; Order Instantly
            </p>
            <p className="hero-description">
              Experience curated dishes delivered right to your doorstep.
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = 'https://ownbites.netlify.app/'}
              >
                ORDER NOW
              </button>
            </div>
          </div>

          {/* Right Column - Image & Floating Cards */}
          <div className="hero-image-wrapper">
            <div className="hero-image-container">
              <img 
                src="hero-food.jpg" 
                alt="Delicious South Indian Dosa, Idli, and Sambar spread" 
                className="hero-main-img" 
              />
            </div>
            
            {/* Float Cards */}
            <div className="glass-card card-delivery float-card" onClick={triggerDelivery}>
              <div className="card-icon-circle">
                <Truck size={18} />
              </div>
              <div className="card-info">
                <span className="card-title">DOOR DELIVERY</span>
                <span className="card-subtitle">(30 mins)</span>
              </div>
            </div>

            <div className="glass-card card-pickup float-card" onClick={triggerPickup}>
              <div className="card-icon-circle">
                <Store size={18} />
              </div>
              <div className="card-info">
                <span className="card-title">SELF PICKUP</span>
                <span className="card-subtitle">(Available)</span>
              </div>
            </div>

            <div className="glass-card card-offers float-card" onClick={triggerOffersScroll}>
              <div className="card-icon-circle">
                <Tag size={18} />
              </div>
              <div className="card-info">
                <span className="card-title">SMART OFFERS</span>
                <span className="card-subtitle">(Get 20% Off)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="main-content">
        
        {/* Offers Section */}
        <section className="section offers-section" id="offers-section" ref={offersSectionRef}>
          <div className="section-header text-center">
            <span className="section-tagline">Deals Of The Day</span>
            <h2 className="section-title">EXCLUSIVE SMART OFFERS</h2>
            <div className="title-divider"></div>
            <p className="offers-subtitle">Save big on your favorite meals!</p>
          </div>
          
          <div className="offers-grid-new">
            {/* Card 1 - Valid Now (green tint) */}
            <div className="offer-card-new offer-green">
              <div className="offer-card-top">
                <span className="offer-tag offer-tag-green">VALID NOW</span>
                <span className="offer-card-icon">🍽️</span>
              </div>
              <h3 className="offer-amount">₹80 OFF</h3>
              <p className="offer-desc">Enjoy a flat ₹80 discount when you place an order of ₹300 or more.</p>
            </div>

            {/* Card 2 - Trending (pink tint) */}
            <div className="offer-card-new offer-pink">
              <div className="offer-card-top">
                <span className="offer-tag offer-tag-pink">TRENDING</span>
                <span className="offer-card-icon">🔥</span>
              </div>
              <h3 className="offer-amount">₹100 OFF</h3>
              <p className="offer-desc">Get a fantastic ₹100 discount on all orders exceeding ₹500.</p>
            </div>

            {/* Card 3 - Premium (yellow tint) */}
            <div className="offer-card-new offer-yellow">
              <div className="offer-card-top">
                <span className="offer-tag offer-tag-yellow">PREMIUM</span>
                <span className="offer-card-icon">⭐</span>
              </div>
              <h3 className="offer-amount">₹200 OFF</h3>
              <p className="offer-desc">Instant ₹200 savings! Treat yourself to a grand feast for orders above ₹1500.</p>
            </div>

            {/* Card 4 - New User (blue tint) */}
            <div className="offer-card-new offer-blue">
              <div className="offer-card-top">
                <span className="offer-tag offer-tag-blue">NEW USER</span>
                <span className="offer-card-icon">🎉</span>
              </div>
              <h3 className="offer-amount">50% OFF</h3>
              <p className="offer-desc">Enjoy 50% off up to ₹150 on your very first order with us!</p>
            </div>
          </div>
        </section>


        {/* Menu Section */}
        <section className="section menu-section" id="menu-section" ref={menuSectionRef}>
          <div className="section-header">
            <div>
              <span className="section-tagline">Top Picks</span>
              <h2 className="section-title">BEST SELLING PRODUCTS</h2>
            </div>
            
            {/* Categories tabs */}
            <div className="menu-categories">
              {['all', 'dosa', 'idli', 'rice', 'snacks', 'sweets', 'drinks'].map(cat => (
                <button 
                  key={cat}
                  className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat === 'dosa' ? 'Dosas' : cat === 'idli' ? 'Idli & Vada' : cat === 'rice' ? 'Rice & Thali' : cat === 'snacks' ? 'Snacks' : cat === 'drinks' ? 'Drinks' : 'Sweets'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Search stats */}
          {searchQuery.trim() !== '' && (
            <div className="search-stats-container">
              <span className="search-results-text">
                Showing results for "<strong>{searchQuery}</strong>"
              </span>
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Menu Grid */}
          <div className="menu-grid">
            {filteredMenu.map(dish => {
              return (
                <div className="dish-card" key={dish.id}>
                  <div className="dish-img-container">
                    <img className="dish-img" src={dish.image} alt={dish.title} loading="lazy" />
                    {dish.veg ? (
                      <span className="dish-badge badge-veg">Pure Veg</span>
                    ) : null}
                  </div>
                  <div className="dish-info">
                    <h3 className="dish-title">{dish.emoji} {dish.title}</h3>
                    <p className="dish-desc">{dish.description}</p>
                  </div>
                </div>
              );
            })}

            {filteredMenu.length === 0 && (
              <div className="text-center" style={{ gridColumn: 'span 4', padding: '4rem 1rem' }}>
                <h3>No dishes found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try searching for another dish or clear the filter.</p>
              </div>
            )}
          </div>
        </section>


      </main>

      {/* Slide-out Shopping Cart Sidebar Drawer */}
      <div 
        className={`cart-sidebar-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
      ></div>
      <aside className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <div className="cart-title-area">
            <h2>YOUR ORDER</h2>
            <span className="cart-count">
              {cart.reduce((acc, item) => acc + item.qty, 0)} items
            </span>
          </div>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-items-wrapper">
          {cart.map(item => (
            <div className="cart-item" key={item.id}>
              <img className="cart-item-img" src={item.image} alt={item.title} />
              <div className="cart-item-info">
                <h4 className="cart-item-title">{item.title}</h4>
                <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
              </div>
              <div className="cart-item-actions">
                <button 
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQty(item.id, -1)}
                >
                  &minus;
                </button>
                <span className="cart-qty-val">{item.qty}</span>
                <button 
                  className="cart-qty-btn"
                  onClick={() => handleUpdateQty(item.id, 1)}
                >
                  &plus;
                </button>
                <button 
                  className="cart-item-remove"
                  onClick={() => handleRemoveCartItem(item.id)}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="empty-cart-state">
              <div className="empty-icon-circle">
                <ShoppingCart size={32} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Browse our menu and add items to get started!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                SHOP NOW
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            
            {/* Promo Code section */}
            <div className="coupon-section">
              {!appliedCoupon ? (
                <form className="coupon-input-wrapper" onSubmit={handleApplyCoupon}>
                  <input 
                    type="text" 
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary apply-coupon-btn">APPLY</button>
                </form>
              ) : (
                <div className="applied-coupon-status">
                  <span className="success-message">Promo Applied: <strong>{appliedCoupon}</strong></span>
                  <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>&times;</button>
                </div>
              )}
            </div>

            {/* Summary details */}
            <div className="cart-summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Taxes & GST (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Checkout */}
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              PLACE ORDER
            </button>
          </div>
        )}
      </aside>

      {/* Sign In Modal */}
      <div className={`modal-overlay ${isSignInOpen ? 'active' : ''}`}>
        <div className="modal-card">
          <button className="modal-close" onClick={() => setIsSignInOpen(false)}>&times;</button>
          <div className="modal-header">
            <h3>Welcome Back</h3>
            <p>Login to track orders, save addresses, and earn smart rewards.</p>
          </div>
          
          <form className="modal-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={signinFormVal.email}
                onChange={(e) => setSigninFormVal(prev => ({ ...prev, email: e.target.value }))}
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={signinFormVal.password}
                onChange={(e) => setSigninFormVal(prev => ({ ...prev, password: e.target.value }))}
                required 
              />
            </div>
            
            <div className="form-footer-actions">
              <label className="remember-me">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a href="#" className="forgot-pass-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
            </div>
            <button type="submit" className="btn btn-primary modal-submit-btn">SIGN IN</button>
          </form>

          <div className="modal-social-signins">
            <span className="social-divider">Or continue with</span>
            <div className="social-btns">
              <button className="social-btn" onClick={() => { setUserEmail('google-user@ieyal.com'); setIsSignInOpen(false); }}>Google</button>
              <button className="social-btn" onClick={() => { setUserEmail('apple-user@ieyal.com'); setIsSignInOpen(false); }}>Apple</button>
            </div>
          </div>
          <div className="modal-signup-prompt">
            Don't have an account? <a href="#" className="accent-text" onClick={(e) => e.preventDefault()}>Sign Up Now</a>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      <div className={`modal-overlay ${isSuccessOpen ? 'active' : ''}`}>
        <div className="modal-card success-card">
          <div className="success-icon-wrapper">
            <Check size={32} />
          </div>
          <div className="modal-header text-center">
            <h3>Order Placed Successfully!</h3>
            <p>Your authentic South Indian meal is being prepared with high hygiene standards.</p>
          </div>
          
          <div className="success-receipt-details">
            <div className="receipt-row">
              <span>Order Tracking ID:</span>
              <strong>#{lastReceipt.orderId}</strong>
            </div>
            <div className="receipt-row">
              <span>Estimated Delivery:</span>
              <strong>{lastReceipt.eta}</strong>
            </div>
            <div className="receipt-row">
              <span>Total Charged:</span>
              <strong>{lastReceipt.totalCharged}</strong>
            </div>
          </div>
          
          <div className="success-actions" style={{ justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setIsSuccessOpen(false)}
            >
              BACK TO MENU
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Ieyal Section */}
      <section className="why-choose-section">
        <div className="why-choose-banner-container">
          <img src="/why-choose.jpg" className="why-choose-banner-img" alt="Why Choose Ieyal" />
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-brand-column">
            <a href="#" className="logo-brand-container">
              <img src="/logo.png" alt="IEYAL Logo" className="navbar-logo-img" />
              <span className="logo-brand-text">IEYAL</span>
            </a>
            <p className="footer-tagline">
              Crafting exceptional South Indian culinary experiences with premium quality, fresh ingredients, and love since 2012.
            </p>
          </div>
          <div className="footer-links-column">
            <h4>Quick Links</h4>
            <a href="#menu-section">Menu Grid</a>
            <a href="#offers-section">Promo Offers</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          </div>
          <div className="footer-contact-column">
            <h4>Connect With Us</h4>
            <p>Email: contact@ieyal-flavours.com</p>
            <p>Phone: +1 (555) 019-2834</p>
            <p>Address: 482 Authentic Street, Food District, FL</p>
          </div>
        </div>
        <div className="footer-copyright">
          &copy; 2026 IEYAL SOLUTIONS. All rights reserved. Built with love & Orange design theme.
        </div>
      </footer>

    </div>
  );
}

export default App;
