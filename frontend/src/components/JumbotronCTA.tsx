'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onOpenContact: () => void;
}

export default function JumbotronCTA({ onOpenContact }: Props) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-24 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 text-white">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-300 border border-white/10 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Launch Your Modern ERP in Minutes</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Simplify your business operations <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
            let’s get started today!
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Take the next step with Aura ERP, the modular, scalable, and user-friendly Open Source platform designed to automate workflows and accelerate growth.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <span>Start Cloud Hosting</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </Link>

          <button
            onClick={onOpenContact}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>Talk to Enterprise Sales</span>
          </button>
        </div>

      </div>
    </section>
  );
}
