'use client';

import React from 'react';
import { Play, Radio, Mic } from 'lucide-react';

interface Props {
  onOpenVideo: () => void;
}

export default function PodcastStrip({ onOpenVideo }: Props) {
  return (
    <div className="w-full bg-slate-900 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Podcast branding & hosts */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-center md:text-left">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Featured In</span>
              <span className="text-white font-bold">The Enterprise Python & Cloud Podcast</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Hosted by</span>
              <span className="font-semibold text-slate-200">Marcus Vance</span>
              <span>&</span>
              <span className="font-semibold text-slate-200">Elena Rostova</span>
            </div>
          </div>

          {/* Right: Pitch & CTA button */}
          <div className="flex items-center gap-4">
            <p className="hidden lg:block text-xs text-slate-400 max-w-md">
              Learn why Aura ERP sets the benchmark for modern modular business platforms.
            </p>

            <button
              onClick={onOpenVideo}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/30 hover:scale-105 active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Watch Interview</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
