'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NotificationBanner from './NotificationBanner';
import Navbar from './Navbar';
import Footer from './Footer';
import ContactModal from './ContactModal';
import CartDrawer from './CartDrawer';
import VideoModal from './VideoModal';
import SearchModal from './SearchModal';
import { Cart, AnnouncementBanner } from '@/lib/types';
import { getCart, getSiteConfig } from '@/lib/api';

interface Props {
  children: React.ReactNode;
}

export const CartContext = React.createContext<{
  cart: Cart;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  openCart: () => void;
  openContact: () => void;
  openVideo: () => void;
}>({
  cart: { session_id: 'default', items: [], subtotal: 0, discount_amount: 0, total: 0 },
  setCart: () => {},
  openCart: () => {},
  openContact: () => {},
  openVideo: () => {},
});

function AppShellInner({ children }: Props) {
  const pathname = usePathname();
  const isERPApp = pathname?.startsWith('/app');
  const [banner, setBanner] = useState<AnnouncementBanner | null>({
    id: 1,
    headline: 'Aura Cloud: $29/Month. One ERP. Your Entire Enterprise',
    cta_text: 'Aura Cloud Hosting',
    cta_url: '/pricing',
    background_color: '#4F46E5',
    text_color: '#FFFFFF',
    is_active: true,
  });

  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState<Cart>({
    session_id: 'session-guest',
    items: [],
    subtotal: '0.00',
    discount_amount: '0.00',
    total: '0.00',
  });

  useEffect(() => {
    // Generate or fetch session ID from localStorage
    let sid = localStorage.getItem('aura_cart_session');
    if (!sid) {
      sid = 'aura_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('aura_cart_session', sid);
    }

    // Load initial cart
    getCart(sid).then((c) => {
      if (c) setCart(c);
    });

    // Load site banner from Django API
    getSiteConfig().then((config) => {
      if (config?.banner) {
        setBanner(config.banner);
      }
    });

    // Keyboard shortcut listener for Ctrl+K
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const totalCartCount = cart.items.reduce((acc, curr) => acc + curr.quantity, 0);

  if (isERPApp) {
    return (
      <CartContext.Provider
        value={{
          cart,
          setCart,
          openCart: () => setCartOpen(true),
          openContact: () => setContactOpen(true),
          openVideo: () => setVideoOpen(true),
        }}
      >
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
          {children}
        </div>
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        openCart: () => setCartOpen(true),
        openContact: () => setContactOpen(true),
        openVideo: () => setVideoOpen(true),
      }}
    >
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Top Notification Banner */}
        <NotificationBanner banner={banner} />

        {/* Header Navigation */}
        <React.Suspense fallback={<div className="h-16" />}>
          <Navbar
            onOpenContact={() => setContactOpen(true)}
            onOpenCart={() => setCartOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            cartCount={totalCartCount}
          />
        </React.Suspense>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Interactive Modals */}
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          onUpdateCart={(updated) => setCart(updated)}
        />
        <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </CartContext.Provider>
  );
}

export default function AppShell({ children }: Props) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AppShellInner>{children}</AppShellInner>
    </React.Suspense>
  );
}
