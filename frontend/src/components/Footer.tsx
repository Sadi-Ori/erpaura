'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon, YoutubeIcon } from './BrandIcons';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs">
      
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-base">
                A
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Aura<span className="text-indigo-400">ERP</span>
              </span>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed">
              Open-source enterprise platform engineered with Python/Django and Next.js for scalable operations.
            </p>

            <div className="space-y-2 pt-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>support@auraerp.io</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+1 (888) 287-2377</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>San Francisco, CA & Global</span>
              </div>
            </div>
          </div>

          {/* Column 2: AuraERP Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">AuraERP</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Updates</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Download Open Source</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/demo" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">Live Interactive Demo</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">User Documentation</Link></li>
              <li><Link href="/docs/developer-guide" className="hover:text-white transition-colors">Dev Documentation</Link></li>
              <li><Link href="/docs/knowledgebase" className="hover:text-white transition-colors">Knowledgebase</Link></li>
              <li><Link href="/blog/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link href="/services#roadmap" className="hover:text-white transition-colors">Product Roadmap</Link></li>
              <li><Link href="/services#partners" className="hover:text-white transition-colors">Partner Ecosystem</Link></li>
            </ul>
          </div>

          {/* Column 3: Modules */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Modules</h4>
            <ul className="space-y-2">
              <li><Link href="/modules/project-management" className="hover:text-white transition-colors">Project Management System</Link></li>
              <li><Link href="/modules/sales-management" className="hover:text-white transition-colors">Sales & Quoting</Link></li>
              <li><Link href="/modules/inventory-management" className="hover:text-white transition-colors">Inventory Management</Link></li>
              <li><Link href="/modules/contact-management" className="hover:text-white transition-colors">Contact Management</Link></li>
              <li><Link href="/modules/recruitment-management" className="hover:text-white transition-colors">Recruitment & ATS</Link></li>
              <li><Link href="/modules/time-off-management" className="hover:text-white transition-colors">Time Off Management</Link></li>
              <li><Link href="/modules/product-management" className="hover:text-white transition-colors">Product Management</Link></li>
              <li><Link href="/modules/website-management" className="hover:text-white transition-colors">Website Visual CMS</Link></li>
              <li><Link href="/modules/invoice-management" className="hover:text-white transition-colors">Invoice Management</Link></li>
              <li><Link href="/modules/purchase-order" className="hover:text-white transition-colors">Purchase Order System</Link></li>
              <li><Link href="/modules/manufacturing-management" className="hover:text-white transition-colors">Manufacturing (MRP)</Link></li>
              <li><Link href="/modules/point-of-sale" className="hover:text-white transition-colors">Point of Sale (POS)</Link></li>
            </ul>
          </div>

          {/* Column 4: Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/services#custom-development" className="hover:text-white transition-colors">Custom ERP Development</Link></li>
              <li><Link href="/services#support-maintenance" className="hover:text-white transition-colors">ERP Support & Maintenance</Link></li>
              <li><Link href="/services#migration" className="hover:text-white transition-colors">ERP Migration Services</Link></li>
              <li><Link href="/services#white-label" className="hover:text-white transition-colors">White Label ERP</Link></li>
              <li><Link href="/services#integration" className="hover:text-white transition-colors">ERP Integration & APIs</Link></li>
              <li><Link href="/docs/mcp" className="hover:text-white transition-colors">Aura MCP AI Server</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Managed Cloud Hosting</Link></li>
            </ul>
          </div>

          {/* Column 5: Social & Compliance */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/auraerp/auraerp"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/AuraERP"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/auraerp"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@AuraERP"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-900 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AICPA SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>ISO 27001 & 9001 Compliant</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <p>© 2026 Aura ERP. All Rights Reserved. Open-source enterprise framework released under MIT License.</p>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/docs" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/docs" className="hover:text-slate-300">Security Architecture</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
