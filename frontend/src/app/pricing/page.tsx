'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, Server, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { CartContext } from '@/components/AppShell';

const plans = [
  {
    id: 1,
    name: 'Community Open-Source',
    badge: 'Free Forever',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Self-hosted deployment on your own infrastructure with complete source code access.',
    features: [
      'Full open-source source code (MIT License)',
      'All 15 core ERP modules included',
      'Unlimited self-hosted users',
      'Community Discord & GitHub support',
      'Self-managed database & updates',
      'RESTful JSON API access',
    ],
    popular: false,
    cta: 'Download Code',
    href: 'https://github.com/auraerp/auraerp',
  },
  {
    id: 2,
    name: 'Cloud Starter',
    badge: 'Special Offer 🎉',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'Fully managed high-performance cloud ERP for growing small & midsize businesses.',
    features: [
      'One-click managed cloud setup on custom domain',
      'Automated nightly encrypted offsite backups',
      'Free SSL certificate & DDoS protection',
      'Up to 15 active enterprise user seats',
      '100 GB ultra-fast NVMe storage',
      'Email & ticket support with 24h SLA',
      'Automatic rolling security updates',
    ],
    popular: true,
    cta: 'Start Cloud Hosting',
  },
  {
    id: 3,
    name: 'Enterprise Pro',
    badge: 'High Growth',
    monthlyPrice: 89,
    yearlyPrice: 890,
    description: 'Scalable multi-company multi-warehouse cloud for expanding operations.',
    features: [
      'Everything in Cloud Starter',
      'Unlimited user seats & role hierarchies',
      'Multi-company & multi-currency consolidation',
      'Dedicated isolated PostgreSQL & Redis cluster',
      'AI Agent & MCP Tooling integration',
      '500 GB NVMe storage & 99.99% uptime SLA',
      'Priority 2-hour response SLA support',
    ],
    popular: false,
    cta: 'Deploy Enterprise Pro',
  },
  {
    id: 4,
    name: 'Custom Dedicated Scale',
    badge: 'Sovereign Cloud',
    monthlyPrice: 249,
    yearlyPrice: 2490,
    description: 'Air-gapped on-premise or sovereign cloud with tailored custom modules.',
    features: [
      'Everything in Enterprise Pro',
      'Custom code & bespoke module development',
      'White-label branding & custom domain IP',
      'Dedicated solutions architect & account manager',
      'Custom ERP migration from SAP, Odoo, NetSuite',
      'SOC 2 Type II compliance audit reports',
      '24/7/365 live phone support & dedicated Slack channel',
    ],
    popular: false,
    cta: 'Contact Architecture Team',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { cart, setCart, openCart, openContact } = useContext(CartContext);
  const [addedPlanId, setAddedPlanId] = useState<number | null>(null);

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) {
      window.open(plan.href, '_blank');
      return;
    }

    if (plan.monthlyPrice === 249) {
      openContact();
      return;
    }

    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    const newItem = {
      id: Date.now(),
      plan: {
        id: plan.id,
        name: plan.name,
        slug: plan.name.toLowerCase().replace(/ /g, '-'),
        monthly_price: plan.monthlyPrice,
        yearly_price: plan.yearlyPrice,
        description: plan.description,
        features: plan.features,
        is_popular: plan.popular,
        order: plan.id,
      },
      quantity: 1,
      billing_cycle: billingCycle,
      unit_price: price,
      total_price: price,
    };

    const newItems = [...cart.items, newItem];
    const newSub = newItems.reduce((acc, curr) => acc + Number(curr.total_price), 0);
    const disc = cart.coupon ? newSub * 0.2 : 0;

    setCart({
      ...cart,
      items: newItems,
      subtotal: newSub,
      discount_amount: disc,
      total: Math.max(0, newSub - disc),
    });

    setAddedPlanId(plan.id);
    setTimeout(() => {
      setAddedPlanId(null);
      openCart();
    }, 400);
  };

  return (
    <div className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Transparent, Scalable Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            One ERP. Your Entire Enterprise.
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Choose between free community open-source self-hosting or fully managed, secure cloud hosting with automatic updates and continuous daily backups.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Plans Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const isAdded = addedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 lg:-translate-y-2'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                    {plan.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-slate-400">
                        /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.monthlyPrice > 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        Equivalent to ${(price / 12).toFixed(1)}/month
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-4 text-xs font-bold rounded-xl transition-all shadow-sm ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {isAdded ? 'Added to Cart ✓' : plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Cloud Hosting Features Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-indigo-400 shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Isolated High-Speed Infrastructure</h4>
                <p className="text-xs text-slate-300 mt-1">Each instance is provisioned with dedicated CPU, NVMe drives, and Redis cache layer.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Daily Encrypted Offsite Backups</h4>
                <p className="text-xs text-slate-300 mt-1">Point-in-time recovery with 30-day snapshot history stored in geo-redundant vaults.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-purple-400 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Zero-Downtime Rolling Updates</h4>
                <p className="text-xs text-slate-300 mt-1">Seamless security patches and module upgrades applied automatically without interruption.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
