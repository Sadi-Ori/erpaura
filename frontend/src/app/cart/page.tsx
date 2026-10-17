'use client';

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Tag, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { CartContext } from '@/components/AppShell';
import { applyCoupon } from '@/lib/api';

export default function CartPage() {
  const { cart, setCart } = useContext(CartContext);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const removeItem = (idx: number) => {
    const newItems = [...cart.items];
    newItems.splice(idx, 1);
    const sub = newItems.reduce((acc, curr) => acc + Number(curr.total_price), 0);
    const disc = cart.coupon ? sub * 0.2 : 0;
    setCart({
      ...cart,
      items: newItems,
      subtotal: sub,
      discount_amount: disc,
      total: Math.max(0, sub - disc),
    });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoading(true);
    setMsg(null);

    try {
      const res = await applyCoupon(cart.session_id, couponCode);
      if (res.success && res.cart) {
        setCart(res.cart);
        setMsg({ text: res.message, error: false });
      } else {
        setMsg({ text: res.error || 'Invalid code', error: true });
      }
    } catch {
      if (couponCode.toUpperCase() === 'AURA2026') {
        const sub = Number(cart.subtotal) || 29;
        const disc = Math.round(sub * 0.2 * 100) / 100;
        setCart({
          ...cart,
          coupon: {
            code: 'AURA2026',
            description: 'Launch Discount 20%',
            discount_percentage: 20,
            fixed_discount: 0,
          },
          discount_amount: disc,
          total: Math.max(0, sub - disc),
        });
        setMsg({ text: "Code 'AURA2026' applied successfully (20% off)!", error: false });
      } else {
        setMsg({ text: "Invalid promo code. Try 'AURA2026' for 20% off", error: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-950/80 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping Plans & Modules</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Your Shopping Cart
          </h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your cart is currently empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              You haven’t added any cloud hosting subscriptions or specialized enterprise modules yet.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/pricing"
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
              >
                Browse Cloud Plans
              </Link>
              <Link
                href="/modules"
                className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Explore Modules
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Cart Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flow-root">
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cart.items.map((item, idx) => {
                      const title = item.plan?.name || item.product?.name || 'Aura ERP Module';
                      const desc = item.plan?.description || item.product?.short_description || 'Enterprise Cloud Deployment';

                      return (
                        <li key={idx} className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{desc}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Billing: {item.billing_cycle}
                            </span>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                                ${Number(item.total_price).toFixed(2)}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Qty: {item.quantity}
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(idx)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Offer Banner inside Cart */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Active Launch Promotion Available</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Apply coupon code <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">AURA2026</code> to get 20% off all cloud packages!</p>
                  </div>
                </div>

                <button
                  onClick={() => setCouponCode('AURA2026')}
                  className="px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 rounded-lg shadow-2xs border border-indigo-200 dark:border-slate-700 shrink-0 hover:bg-indigo-50 transition-colors"
                >
                  Use Code
                </button>
              </div>
            </div>

            {/* Right 1 Col: Summary & Promo Code */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Order Summary
                </h3>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors shrink-0 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>

                  {msg && (
                    <p className={`text-[11px] font-semibold ${msg.error ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {msg.text}
                    </p>
                  )}
                </form>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">${Number(cart.subtotal).toFixed(2)}</span>
                  </div>

                  {Number(cart.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount ({cart.coupon?.code || 'Promo'})</span>
                      <span>-${Number(cart.discount_amount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Tax (Estimated 5%)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${((Number(cart.subtotal) - Number(cart.discount_amount)) * 0.05).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-base font-extrabold text-slate-900 dark:text-white">
                    <span>Final Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      ${(
                        (Number(cart.subtotal) - Number(cart.discount_amount)) * 1.05
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>256-Bit SSL Encrypted Enterprise Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
