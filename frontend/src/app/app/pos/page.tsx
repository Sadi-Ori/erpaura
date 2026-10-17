'use client';

import React, { useState } from 'react';
import {
  Store,
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
  Search,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { createPOSTransaction } from '@/lib/erp-api';
import { POSTransaction } from '@/lib/types';

interface POSItem {
  id: number;
  name: string;
  category: string;
  price: number;
  sku: string;
}

const catalog: POSItem[] = [
  { id: 1, name: 'Cloud Instance Starter Pack', category: 'Cloud', price: 29.00, sku: 'SRV-01' },
  { id: 2, name: 'Enterprise Pro Cluster Seat', category: 'Cloud', price: 89.00, sku: 'SRV-02' },
  { id: 3, name: 'Wireless Barcode Scanner (Handheld)', category: 'Hardware', price: 120.00, sku: 'HW-SCN' },
  { id: 4, name: 'RFID Distribution Portal Sensor', category: 'Hardware', price: 450.00, sku: 'HW-RFID' },
  { id: 5, name: 'Thermal Receipt Rolls (Box of 20)', category: 'Peripherals', price: 60.00, sku: 'ACC-ROL' },
  { id: 6, name: 'Heavy-Duty USB POS Drawer', category: 'Hardware', price: 180.00, sku: 'HW-CSH' },
  { id: 7, name: 'Custom ERP Data ETL Consulting (1hr)', category: 'Services', price: 150.00, sku: 'SRV-CON' },
  { id: 8, name: 'High-Speed Label Printer (Industrial)', category: 'Hardware', price: 340.00, sku: 'HW-LBL' },
];

export default function POSTerminalPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Array<{ item: POSItem; qty: number }>>([
    { item: catalog[2], qty: 1 },
    { item: catalog[4], qty: 2 },
  ]);

  // Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('card');
  const [amountTendered, setAmountTendered] = useState<string>('');
  
  // Receipt Modal
  const [receipt, setReceipt] = useState<POSTransaction | null>(null);

  const categories = ['All', 'Cloud', 'Hardware', 'Peripherals', 'Services'];

  const filteredCatalog = catalog.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addItem = (item: POSItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => (i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.item.id === id) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as Array<{ item: POSItem; qty: number }>
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((i) => i.item.id !== id));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleOpenPay = () => {
    if (cart.length === 0) return;
    setAmountTendered(total.toFixed(2));
    setPayModalOpen(true);
  };

  const handleCompleteSale = async () => {
    const tendered = parseFloat(amountTendered) || total;
    const changeDue = Math.max(0, Math.round((tendered - total) * 100) / 100);
    const receiptNo = `REC-${Math.floor(10000 + Math.random() * 90000)}`;

    const payload: Partial<POSTransaction> = {
      receipt_number: receiptNo,
      cashier_name: 'Admin Operator',
      customer_name: 'Walk-in Retail Client',
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: '0.00',
      total_amount: total.toFixed(2),
      amount_tendered: tendered.toFixed(2),
      change_due: changeDue.toFixed(2),
      payment_method: paymentMethod,
      items_data: cart.map((i) => ({ name: i.item.name, qty: i.qty, price: i.item.price })),
    };

    try {
      const saved = await createPOSTransaction(payload);
      setReceipt(saved);
    } catch (e) {
      setReceipt(payload as POSTransaction);
    }

    setPayModalOpen(false);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Point of Sale (POS) Terminal</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Aureus POS Register
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fast touch billing terminal with instant receipt generation and stock synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Register: <strong className="text-white font-mono">REG-01 (HQ Floor)</strong></span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Ready</span>
        </div>
      </div>

      {/* POS Terminal Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Catalog & Categories */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Scan or search item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-hidden text-xs text-slate-200 placeholder-slate-500 w-full"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all text-left space-y-2 group flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">{item.category}</span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mt-1">
                    {item.name}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-sm font-extrabold text-emerald-400">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Right Col: Register Cart & Tender */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 sticky top-20 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Current Ticket</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {cart.reduce((a, b) => a + b.qty, 0)} Items
            </span>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {cart.map(({ item, qty }) => (
              <div key={item.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 flex-1 truncate">
                  <div className="font-semibold text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400">
                    ${item.price.toFixed(2)} × {qty} = <strong className="text-emerald-400">${(item.price * qty).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-xs font-bold text-white w-5 text-center">{qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Ticket is empty. Tap items on the left to add.
              </div>
            )}
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax (5%):</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Due:</span>
              <span className="font-mono text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout / Pay Button */}
          <button
            onClick={handleOpenPay}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay ${total.toFixed(2)}</span>
          </button>

        </div>

      </div>

      {/* Tender Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Collect Tender Payment</h3>
              <button onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Balance Due</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">${total.toFixed(2)}</div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                  paymentMethod === 'qr'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span>QR Pay</span>
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-400 font-semibold">Amount Tendered ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold focus:outline-hidden focus:border-emerald-500"
                />
                {parseFloat(amountTendered) >= total && (
                  <div className="flex justify-between text-xs font-bold text-emerald-400 pt-1">
                    <span>Change Due to Customer:</span>
                    <span>${(parseFloat(amountTendered) - total).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCompleteSale}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Transaction & Print Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Instant Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white text-slate-900 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <div className="text-base font-black tracking-tight">AURA ERP STORE #01</div>
              <div className="text-[10px] text-slate-600">100 Tech Blvd, Silicon Valley, CA</div>
              <div className="text-[10px] text-slate-500 font-semibold">{receipt.receipt_number}</div>
            </div>

            <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 text-[11px]">
              {receipt.items_data.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[180px]">{item.qty}x {item.name}</span>
                  <span>${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${receipt.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>${receipt.tax}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>${receipt.total_amount}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span>Paid via {receipt.payment_method.toUpperCase()}:</span>
                <span>${receipt.amount_tendered}</span>
              </div>
              {parseFloat(String(receipt.change_due)) > 0 && (
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Change:</span>
                  <span>${receipt.change_due}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
              Thank you for choosing Aura ERP!
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-sans text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-800 font-sans text-xs font-bold hover:bg-slate-200"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
