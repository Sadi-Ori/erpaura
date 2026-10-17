'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { AnnouncementBanner } from '@/lib/types';

interface Props {
  banner?: AnnouncementBanner | null;
}

export default function NotificationBanner({ banner }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !banner || !banner.is_active) {
    return null;
  }

  return (
    <div
      className="relative z-50 flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-medium transition-all"
      style={{
        backgroundColor: banner.background_color || '#4F46E5',
        color: banner.text_color || '#FFFFFF',
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center pr-6">
        <span>{banner.headline}</span>
        <Link
          href={banner.cta_url || '/pricing'}
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:opacity-90 transition-opacity"
        >
          <span>{banner.cta_text || 'Aura Cloud Hosting'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
