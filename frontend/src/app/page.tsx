'use client';

import React, { useContext, useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import PodcastStrip from '@/components/PodcastStrip';
import ApplicationsGrid from '@/components/ApplicationsGrid';
import ResultsBento from '@/components/ResultsBento';
import IntegrationSection from '@/components/IntegrationSection';
import FeaturesGrid from '@/components/FeaturesGrid';
import WhyChooseUs from '@/components/WhyChooseUs';
import FAQSection from '@/components/FAQSection';
import JumbotronCTA from '@/components/JumbotronCTA';
import { CartContext } from '@/components/AppShell';
import { getFAQs } from '@/lib/api';
import { FAQItem } from '@/lib/types';

export default function HomePage() {
  const { openContact, openVideo } = useContext(CartContext);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    getFAQs().then((items) => {
      if (items && items.length > 0) {
        setFaqs(items);
      }
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection onOpenVideo={openVideo} />

      {/* 2. Media / Podcast Feature Strip */}
      <PodcastStrip onOpenVideo={openVideo} />

      {/* 3. Core Applications Grid (PMS, Inventory, Sales, HR, etc.) */}
      <ApplicationsGrid />

      {/* 4. Efficiency & Results Bento Grid */}
      <ResultsBento />

      {/* 5. Integration Capabilities (Native + Third Party + AI Agents) */}
      <IntegrationSection />

      {/* 6. Building Blocks & Core Features Grid */}
      <FeaturesGrid />

      {/* 7. Why Choose Us Section */}
      <WhyChooseUs />

      {/* 8. Frequently Asked Questions Accordion */}
      <FAQSection faqs={faqs} />

      {/* 9. Jumbotron Call to Action */}
      <JumbotronCTA onOpenContact={openContact} />
    </div>
  );
}
