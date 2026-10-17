'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Loader2 } from 'lucide-react';
import { Cart } from '@/lib/types';
import { applyCoupon } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateCart: (updated: Cart) => void;
}

export default function CartDrawer({ isOpen, onClose, cart, onUpdateCart }: Props) {
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMsg(null);

    try {
      const res = await applyCoupon(cart.session_id, couponInput);
      if (res.success && res.cart) {
        onUpdateCart(res.cart);
        setCouponMsg({ text: res.message || 'Coupon applied!', error: false });
      } else {
        setCouponMsg({ text: res.error || 'Invalid promotional code', error: true });
      }
    } catch {
      // Offline fallback: if code is AURA2026 apply 20%
      if (couponInput.toUpperCase() === 'AURA2026') {
        const sub = Number(cart.subtotal) || 29;
        const disc = Math.round(sub * 0.2 * 100) / 100;
        onUpdateCart({
          ...cart,
          coupon: {
            code: 'AURA2026',
            description: '20% Special Launch Discount',
            discount_percentage: 20,
            fixed_discount: 0,
          },
          discount_amount: disc,
          total: Math.max(0, sub - disc),
        });
        setCouponMsg({ text: "Code 'AURA2026' applied successfully (20% off)!", error: false });
      } else {
        setCouponMsg({ text: "Invalid promo code. Try 'AURA2026' for 20% off", error: true });
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...cart.items];
    newItems.splice(index, 1);
    const newSub = newItems.reduce((acc, curr) => acc + Number(curr.total_price), 0);
    const disc = cart.coupon ? (newSub * 0.2) : 0;
    onUpdateCart({
      ...cart,
      items: newItems,
      subtotal: newSub,
      discount_amount: disc,
      total: Math.max(0, newSub - disc),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Cloud Cart
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {cart.items.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100 dark:divide-slate-800">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-12 h-12 mb-3 stroke-1" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select a managed cloud hosting tier or specialized modular pack to get started.
                </p>
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  View Cloud Plans & Offers
                </Link>
              </div>
            ) : (
              cart.items.map((item, idx) => {
                const title = item.plan?.name || item.product?.name || 'Aura ERP Subscription';
                return (
                  <div key={idx} className="py-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Cycle: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{item.billing_cycle}</span> • Qty: {item.quantity}
                      </div>
                      <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                        ${Number(item.total_price).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon Code & Summary Section */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-4">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. AURA2026)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white uppercase placeholder:normal-case"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors shrink-0 disabled:opacity-60"
                  >
                    {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </div>

                {couponMsg && (
                  <p className={`text-[11px] font-semibold ${couponMsg.error ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </form>

              {/* Price Calculation */}
              <div className="space-y-1.5 pt-2 text-xs text-slate-600 dark:text-slate-400">
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

                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Estimated Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${Number(cart.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Proceed to Enterprise Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
