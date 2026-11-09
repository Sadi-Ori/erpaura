'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  CheckCircle2,
  X,
  Tag,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { ProductModule, POSTransaction } from '@/lib/types';
import { getProductsForPOS, processPOSCheckout } from '@/lib/inventory-pos-api';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export default function POSTerminalPage() {
  const [products, setProducts] = useState<ProductModule[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Active Cart Ticket
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Modals
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [tenderMethod, setTenderMethod] = useState<'cash' | 'card' | 'qr'>('card');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<POSTransaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsForPOS();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Cart operations
  const addToCart = (prod: ProductModule) => {
    if (!prod.id) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: prod.id,
          product_id: prod.id,
          name: prod.name,
          sku: prod.sku || `SKU-${prod.id}`,
          price: parseFloat(String(prod.price || 0)),
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.0825 * 100) / 100; // 8.25% sales tax
  const totalAmount = Math.round((taxableSubtotal + taxAmount) * 100) / 100;

  const tenderedNum = parseFloat(cashTendered || String(totalAmount));
  const changeDue = Math.max(0, tenderedNum - totalAmount);

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) return;
    setCashTendered(String(totalAmount));
    setCheckoutModalOpen(true);
  };

  const handleCompleteSale = async () => {
    setProcessing(true);
    try {
      const res = await processPOSCheckout({
        cashier_name: 'Sarah Jenkins',
        customer_name: customerName,
        payment_method: tenderMethod,
        subtotal: subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total_amount: totalAmount,
        amount_tendered: tenderMethod === 'cash' ? tenderedNum : totalAmount,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      if (res && res.success) {
        setCompletedReceipt(res.transaction);
        setCheckoutModalOpen(false);
        clearCart();
        setToastMessage(`Sale processed! Receipt #${res.transaction.receipt_number}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Transaction failed. Check server.');
    } finally {
      setProcessing(false);
    }
  };

  // Categories extraction
  const categories: string[] = [
    'ALL',
    ...Array.from(new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))),
  ];

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Catalog (Left) + Cart Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Product Catalogue */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Scan barcode SKU or search product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Items' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[680px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                No products found in catalogue.
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const price = parseFloat(String(prod.price || 0));
                const inStock = (prod.stock_quantity || 0) > 0;

                return (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between space-y-2 group shadow-xs cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-mono text-slate-400 font-semibold">{prod.sku || `SKU-${prod.id}`}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] ${
                            inStock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {inStock ? `${prod.stock_quantity} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-black font-mono text-emerald-400">
                        ${price.toLocaleString()}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Columns: Active POS Order Ticket */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between min-h-[640px]">
            {/* Ticket Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Current Ticket</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
                  </span>
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      title="Clear Cart"
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Name Input */}
              <div className="my-3 flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-slate-500 shrink-0">Customer:</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-16 text-center text-slate-600 text-xs italic">
                    Tap any product on the left to add items to ticket
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 truncate">
                        <h5 className="font-bold text-white truncate">{item.name}</h5>
                        <span className="text-[10px] font-mono text-slate-400">
                          ${item.price.toLocaleString()} each
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 w-16">
                        <span className="font-mono font-bold text-white">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-1 text-slate-500 hover:text-rose-400 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout Button */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {/* Discount Selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Apply Discount:</span>
                <div className="flex items-center gap-1 text-[11px]">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        discountPercent === pct
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pct === 0 ? 'None' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">${subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono">-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (8.25%):</span>
                  <span className="font-mono text-slate-200">${taxAmount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm font-bold text-white">
                  <span>Total Payable:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tender Button */}
              <button
                disabled={cartItems.length === 0}
                onClick={handleOpenCheckout}
                className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay / Tender Order (${totalAmount.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tender Checkout */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Tender Payment Checkout</h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Highlight */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 block">Total Due</span>
                <span className="text-3xl font-black font-mono text-white">${totalAmount.toLocaleString()}</span>
              </div>
              <span className="text-xs text-slate-400">Customer: <strong className="text-white">{customerName}</strong></span>
            </div>

            {/* Tender Options */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'card', name: 'Credit Card', icon: CreditCard },
                { id: 'cash', name: 'Cash Tender', icon: Banknote },
                { id: 'qr', name: 'Digital QR', icon: QrCode },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTenderMethod(opt.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      tenderMethod === opt.id
                        ? 'border-emerald-500 bg-emerald-600/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{opt.name}</span>
                  </button>
                );
              })}
            </div>

            {/* If Cash: Quick Denomination Buttons & Change Due */}
            {tenderMethod === 'cash' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <label className="block text-slate-400 font-semibold">Cash Amount Tendered ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-3 text-white font-mono font-bold text-lg focus:outline-hidden focus:border-emerald-500"
                />

                <div className="flex gap-2">
                  {[20, 50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(String(amt))}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold"
                    >
                      ${amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashTendered(String(totalAmount))}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-800/40 text-emerald-300 font-semibold"
                  >
                    Exact
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Change Due Customer:</span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    ${changeDue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* If Card / QR */}
            {tenderMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Chip & NFC Contactless Ready</div>
                  <div>Insert, tap, or swipe card on external pin pad reader.</div>
                </div>
              </div>
            )}

            {tenderMethod === 'qr' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <QrCode className="w-8 h-8 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Dynamic QR Wallet Checkout</div>
                  <div>Displaying instant payment QR for Apple Pay / Google Wallet.</div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || (tenderMethod === 'cash' && tenderedNum < totalAmount)}
                onClick={handleCompleteSale}
                className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{processing ? 'Processing Sale...' : 'Authorize & Print Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Printable 80mm Digital Receipt Voucher */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto font-mono text-xs print:p-0 print:shadow-none">
            {/* Header with Print & Close buttons (hidden on print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden font-sans">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Transaction Completed</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setCompletedReceipt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 80mm Receipt Body */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-black tracking-tight text-slate-900">AURA ERP RETAIL</h2>
              <p className="text-[11px] text-slate-600">Downtown Flagship Store #01</p>
              <p className="text-[10px] text-slate-500">450 Market Street • San Francisco, CA</p>
              <p className="text-[10px] text-slate-500">Tel: (415) 392-8810</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-700 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{completedReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{completedReceipt.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{completedReceipt.customer_name}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 text-[11px]">
              <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-slate-200">
                <span>Item / Description</span>
                <span>Total</span>
              </div>
              {completedReceipt.items_data.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span className="truncate pr-2">
                    {it.qty || it.quantity}x {it.name}
                  </span>
                  <span className="shrink-0 font-bold">
                    ${(parseFloat(String(it.price)) * (it.qty || it.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] text-slate-700 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${parseFloat(String(completedReceipt.subtotal)).toLocaleString()}</span>
              </div>
              {parseFloat(String(completedReceipt.discount)) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-${parseFloat(String(completedReceipt.discount)).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax (8.25%):</span>
                <span>${parseFloat(String(completedReceipt.tax)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>${parseFloat(String(completedReceipt.total_amount)).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-1 text-[11px] text-slate-700 pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between uppercase">
                <span>Payment Method:</span>
                <span className="font-bold">{completedReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Tendered:</span>
                <span>${parseFloat(String(completedReceipt.amount_tendered)).toLocaleString()}</span>
              </div>
              {parseFloat(String(completedReceipt.change_due)) > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Change Due:</span>
                  <span>${parseFloat(String(completedReceipt.change_due)).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="text-center space-y-1 pt-1 text-[10px] text-slate-500 font-sans">
              <p className="font-semibold text-slate-700">Thank you for shopping at Aura Retail!</p>
              <p>Items may be returned within 30 days with receipt.</p>
              <p className="font-mono text-[9px] pt-1 text-slate-400">=== END OF RECEIPT ===</p>
            </div>

            <div className="pt-2 print:hidden">
              <button
                onClick={() => setCompletedReceipt(null)}
                className="w-full py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors font-sans text-xs"
              >
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
