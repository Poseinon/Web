import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CompareProvider } from './context/CompareContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { QuickViewModal } from './components/common/QuickViewModal.tsx';
import { Product } from './types/index.ts';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { PcBuilderPage } from './pages/PcBuilderPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { BlogPage } from './pages/BlogPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync with browser URL / history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const searchParams = new URLSearchParams(window.location.search);
      const paramsObj: Record<string, any> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      if (!path || path === '') {
        setCurrentPage('home');
        setPageParams({});
      } else if (path.startsWith('products/')) {
        setCurrentPage('product-detail');
        setPageParams({ id: path.replace('products/', '') });
      } else if (path === 'products') {
        setCurrentPage('products');
        setPageParams(paramsObj);
      } else if (path === 'cart') {
        setCurrentPage('cart');
      } else if (path === 'checkout') {
        setCurrentPage('checkout');
      } else if (path === 'pc-builder') {
        setCurrentPage('pc-builder');
      } else if (path === 'profile') {
        setCurrentPage('profile');
        setPageParams(paramsObj);
      } else if (path === 'compare') {
        setCurrentPage('compare');
      } else if (path.startsWith('blog/')) {
        setCurrentPage('blog');
        setPageParams({ slug: path.replace('blog/', '') });
      } else if (path === 'blog') {
        setCurrentPage('blog');
      } else if (path === 'contact') {
        setCurrentPage('contact');
      } else if (path === 'admin') {
        setCurrentPage('admin');
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: string, params: Record<string, any> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let url = '/';
    if (page === 'home') url = '/';
    else if (page === 'products') {
      const q = new URLSearchParams();
      if (params.category) q.set('category', params.category);
      if (params.brand) q.set('brand', params.brand);
      if (params.search) q.set('search', params.search);
      url = `/products${q.toString() ? '?' + q.toString() : ''}`;
    } else if (page === 'product-detail' && params.id) {
      url = `/products/${params.id}`;
    } else if (page === 'cart') url = '/cart';
    else if (page === 'checkout') url = '/checkout';
    else if (page === 'pc-builder') url = '/pc-builder';
    else if (page === 'profile') {
      url = params.tab ? `/profile?tab=${params.tab}` : '/profile';
    } else if (page === 'compare') url = '/compare';
    else if (page === 'blog') {
      url = params.slug ? `/blog/${params.slug}` : '/blog';
    } else if (page === 'contact') url = '/contact';
    else if (page === 'admin') url = '/admin';

    window.history.pushState(null, '', url);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F14] text-[#F9FAFB]">
      {/* Sticky Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onNavigate={navigate}
        currentPage={currentPage}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'products' && (
          <ProductsPage
            initialCategory={pageParams.category}
            initialBrand={pageParams.brand}
            initialSearch={pageParams.search}
            initialFeatured={pageParams.isFeatured}
            onNavigate={navigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            productId={pageParams.id}
            onNavigate={navigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'cart' && <CartPage onNavigate={navigate} />}

        {currentPage === 'checkout' && <CheckoutPage onNavigate={navigate} />}

        {currentPage === 'order-success' && (
          <OrderSuccessPage order={pageParams.order} onNavigate={navigate} />
        )}

        {currentPage === 'pc-builder' && <PcBuilderPage onNavigate={navigate} />}

        {currentPage === 'profile' && (
          <ProfilePage
            initialTab={pageParams.tab}
            onNavigate={navigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentPage === 'compare' && <ComparePage onNavigate={navigate} />}

        {currentPage === 'blog' && (
          <BlogPage onNavigate={navigate} selectedSlug={pageParams.slug} />
        )}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'admin' && (
          <AdminDashboardPage onNavigate={navigate} onOpenAuth={handleOpenAuth} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <MainApp />
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
