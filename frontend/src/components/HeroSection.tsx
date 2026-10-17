'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Download, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenVideo: () => void;
}

export default function HeroSection({ onOpenVideo }: Props) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-emerald-400/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 mb-6 shadow-xs animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Free Forever Open Source 🎉</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400">Enterprise Cloud from $29/mo</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
          Open Source ERP Platform <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:via-purple-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Built for Modern Enterprise
          </span>
        </h1>

        {/* Tagline / Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Aura ERP orchestrates your entire business operations — accounting, inventory, supply chain, CRM, human resources, and project management — with zero vendor lock-in and complete source code freedom.
        </p>

        {/* Primary Buttons Wrapper */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download & Deploy</span>
          </Link>

          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl transition-all"
          >
            <span>Live Interactive Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Video Trigger */}
        <div className="mt-5 flex items-center justify-center">
          <button
            onClick={onOpenVideo}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1.5 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </span>
            <span>Watch 2-Minute Platform Walkthrough</span>
          </button>
        </div>

        {/* Security & Compliance Trust Strip */}
        <div className="mt-14 pt-8 border-t border-slate-200/70 dark:border-slate-800/70 max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
            Enterprise Security & Global Compliance Standards
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {[
              { label: 'Trusted Cloud Partner', badge: 'Verified' },
              { label: 'CMMI Level 3', badge: 'Certified' },
              { label: 'ISO 27001', badge: 'InfoSec' },
              { label: 'GDPR Aligned', badge: 'Privacy' },
              { label: 'AICPA SOC 2', badge: 'Type II' },
              { label: 'ISO 9001', badge: 'Quality' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">[{item.badge}]</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
