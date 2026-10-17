'use client';

import React from 'react';
import Link from 'next/link';
import { Network, Cpu, ArrowRight, Layers, Workflow, Share2, Server } from 'lucide-react';

export default function IntegrationSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Ecosystem Connectivity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Integration Capabilities
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Integration goes beyond just connecting systems. Aura ERP delivers real results by streamlining data pipelines, increasing operational velocity, and ensuring your enterprise stays connected with modern AI agent tools and third-party services.
          </p>
        </div>

        {/* 2 Big Bento Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Aura Native Integration */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Network className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Aura Native Integration
              </h3>
              
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Seamlessly integrates with your existing corporate software stack — including Microsoft Power BI, Salesforce CRM, custom PostgreSQL/MySQL data lakes, and internal warehouse barcode infrastructure.
              </p>

              {/* Supported Tech Pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['Power BI Connector', 'PostgreSQL Direct', 'Redis Pub/Sub', 'Kafka Streaming', 'FastAPI & Django', 'Celery Workers'].map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Zero data silos</span>
              <Link
                href="/services#integration"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Read Integration Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Third-Party & AI Agent Tool Integrations */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                AI Agent & Third-Party APIs
              </h3>
              
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect external automation platforms (Zapier, Make, n8n) and empower autonomous LLM agents via the Model Context Protocol (MCP) to query stock, generate invoices, and handle customer requests safely.
              </p>

              {/* Supported AI/API Pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['Model Context Protocol (MCP)', 'RESTful JSON API', 'Webhooks Engine', 'Stripe Payments', 'Slack & Teams Bots', 'OpenAPI v3'].map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Standardized REST & MCP</span>
              <Link
                href="/docs/mcp"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Explore AI MCP Server</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
