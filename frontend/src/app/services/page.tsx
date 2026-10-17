'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import {
  Code,
  Headphones,
  Shuffle,
  Award,
  Network,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import { CartContext } from '@/components/AppShell';

const servicesList = [
  {
    id: 'custom-development',
    title: 'Custom ERP Development Services',
    subtitle: 'Bespoke enterprise features tailored to your unique operational processes.',
    icon: Code,
    color: 'from-blue-600 to-indigo-600',
    description: 'When standard off-the-shelf software falls short, our core Django and Next.js engineers build bespoke modules, unique pricing engines, specialized production workflows, and custom reporting dashboards that map 100% to your business requirements.',
    benefits: [
      'Dedicated senior Python/Django systems architect assigned to your account',
      'Clean modular architecture ensuring seamless compatibility with future core updates',
      'Full ownership of custom source code with zero recurring module license fees',
      'Automated unit, integration, and end-to-end regression test suites',
      'Continuous deployment pipeline with staging review environments',
    ],
  },
  {
    id: 'support-maintenance',
    title: 'ERP Support & Maintenance Services',
    subtitle: 'Round-the-clock SLA support, security monitoring, and continuous performance tuning.',
    icon: Headphones,
    color: 'from-emerald-600 to-teal-600',
    description: 'Ensure mission-critical business continuity with guaranteed 24/7 engineering response times, automated encrypted database snapshots, rolling security patch installations, and proactive load-balancer query optimization.',
    benefits: [
      'Guaranteed 1-hour critical response SLA for production incidents',
      'Proactive PostgreSQL database indexing and query latency optimization',
      'Monthly security vulnerability auditing and automated patch management',
      'Dedicated private Slack or Microsoft Teams channel with core developers',
      'Quarterly system architecture reviews and scalability planning',
    ],
  },
  {
    id: 'migration',
    title: 'ERP Migration Services',
    subtitle: 'Zero data-loss transition from legacy ERPs (SAP, Odoo, NetSuite, Dynamics).',
    icon: Shuffle,
    color: 'from-purple-600 to-indigo-600',
    description: 'Migrating enterprise records across decades of operations requires surgical precision. Our data engineers extract, cleanse, transform, and reconcile your historical financial balances, product catalogs, customer transactions, and vendor histories into Aura ERP.',
    benefits: [
      'Complete pre-migration data cleansing and deduplication pipeline',
      'Automated reconciliation verifying trial balance, accounts payable, and receivable',
      'Dual-run parallel validation period minimizing business disruption',
      'Custom legacy database schema mapping (MySQL, Oracle, MS SQL, CSV)',
      'Employee onboarding walkthroughs and role transition training',
    ],
  },
  {
    id: 'white-label',
    title: 'White Label ERP Licensing',
    subtitle: 'Distribute Aura ERP as your own branded enterprise SaaS product.',
    icon: Award,
    color: 'from-amber-500 to-orange-600',
    description: 'Perfect for consultancies, system integrators, and software vendors. Rebrand the entire web application, admin console, mobile responsive views, and automated client email notifications under your own logo, color palette, and custom domain name.',
    benefits: [
      '100% custom branding: logo, typography, color themes, and domain IP',
      'Multi-tenant client provisioning console with isolated database clusters',
      'Integrated Stripe billing to bill your downstream clients directly',
      'Custom iOS and Android PWA app packaging with your company icon',
      'Reseller partner margin discounts and white-label documentation kit',
    ],
  },
  {
    id: 'integration',
    title: 'ERP Integration & AI Agent Tooling',
    subtitle: 'Connect your corporate software stack and modern AI assistants via REST and MCP.',
    icon: Network,
    color: 'from-rose-500 to-pink-600',
    description: 'Unify disparate systems across your enterprise. We engineer resilient bi-directional connectors for Microsoft Power BI, Salesforce, HubSpot, Stripe, logistics carriers (FedEx, UPS, DHL), and Model Context Protocol (MCP) servers for Claude and Copilot agents.',
    benefits: [
      'High-throughput asynchronous webhooks and Kafka / Celery event queues',
      'Native Model Context Protocol (MCP) server integration for autonomous AI',
      'Real-time automated inventory updates across Amazon, Shopify, and retail POS',
      'Power BI data pipeline with pre-built executive visualization templates',
      'OAuth2, API keys, and mutual TLS (mTLS) enterprise authentication',
    ],
  },
];

export default function ServicesPage() {
  const { openContact } = useContext(CartContext);

  return (
    <div className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Enterprise Solutions & Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aura ERP Professional Services
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            From custom module engineering to seamless migration from legacy monoliths, our dedicated technical architects partner with your team to maximize operational throughput.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-12">
          {servicesList.map((svc, idx) => {
            const Icon = svc.icon;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={svc.id}
                id={svc.id}
                className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm scroll-mt-24"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Description & Header */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${svc.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {svc.title}
                        </h2>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                          {svc.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                      {svc.description}
                    </p>

                    <div className="pt-4">
                      <button
                        onClick={openContact}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Schedule Architectural Consultation</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Key Benefits Checklist */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Key Deliverables & Guarantees
                    </h3>
                    {svc.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Global SLA Promise */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Enterprise SLA Guarantee</span>
          </div>
          <h3 className="text-2xl font-bold">Need a bespoke migration or tailored custom integration?</h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Our certified solutions engineers provide fixed-scope proposals, milestone delivery dates, and comprehensive code audits before sign-off.
          </p>
          <div className="pt-2">
            <button
              onClick={openContact}
              className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md"
            >
              Request Custom Enterprise Proposal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
