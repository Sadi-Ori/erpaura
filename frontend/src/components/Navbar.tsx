'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Cpu,
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  FolderKanban,
  Users,
  Briefcase,
  Boxes,
  BookUser,
  ShoppingBag,
  TrendingUp,
  Store,
  FileText,
  Package,
  CalendarClock,
  Globe,
  Receipt,
  Calculator,
  Factory,
  Code,
  Headphones,
  Shuffle,
  Network,
  Award,
  BookOpen,
  Terminal,
  HelpCircle,
  PlayCircle,
  Check,
} from 'lucide-react';
import { GithubIcon } from './BrandIcons';

interface Props {
  onOpenContact: () => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  cartCount: number;
}

export default function Navbar({ onOpenContact, onOpenCart, onOpenSearch, cartCount }: Props) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('v3.2.0');
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-slate-200 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-xl tracking-tighter">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Aura<span className="text-indigo-600 dark:text-indigo-400">ERP</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    Open Source
                  </span>
                </span>
              </div>
            </Link>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search docs & modules...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-300 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Center: Desktop Navigation Bar with Mega Menus */}
          <nav className="hidden lg:flex items-center gap-1">
            
            {/* Pricing */}
            <Link
              href="/pricing"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/pricing'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Pricing
            </Link>

            {/* Agent Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('agent-tools')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDropdown === 'agent-tools'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Agent Tools</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {activeDropdown === 'agent-tools' && (
                <div className="absolute top-full left-0 w-80 pt-2 z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 space-y-1">
                    <Link
                      href="/docs/mcp"
                      onClick={closeDropdowns}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          Aura ERP MCP
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Connect AI assistants directly to live Aura ERP database and tools
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/docs/skills"
                      onClick={closeDropdowns}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          Agent Skills
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Build autonomous background agents for ERP reconciliation & reporting
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modules Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('modules')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDropdown === 'modules'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Modules</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {activeDropdown === 'modules' && (
                <div className="absolute top-full -left-20 w-[740px] pt-2 z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Aura ERP Core Applications
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Comprehensive modular suite designed to scale operations
                        </p>
                      </div>
                      <Link
                        href="/modules"
                        onClick={closeDropdowns}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View all 15 modules →
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { title: 'Project Management', slug: 'project-management', icon: FolderKanban, desc: 'Plan projects, sprints & tasks' },
                        { title: 'Employee Management', slug: 'employee-management', icon: Users, desc: 'HR profiles, attendance & roles' },
                        { title: 'Recruitment System', slug: 'recruitment-management', icon: Briefcase, desc: 'Candidate pipeline & hiring' },
                        { title: 'Inventory Management', slug: 'inventory-management', icon: Boxes, desc: 'Multi-warehouse stock tracking' },
                        { title: 'Contact Management', slug: 'contact-management', icon: BookUser, desc: 'Customers, vendors & leads' },
                        { title: 'Purchase Order', slug: 'purchase-order', icon: ShoppingBag, desc: 'RFQs & vendor procurement' },
                        { title: 'Sales Management', slug: 'sales-management', icon: TrendingUp, desc: 'Quotations & confirmed orders' },
                        { title: 'Point of Sale (POS)', slug: 'point-of-sale', icon: Store, desc: 'Fast retail cashier register' },
                        { title: 'Manufacturing (MRP)', slug: 'manufacturing-management', icon: Factory, desc: 'BOMs, work orders & routings' },
                        { title: 'Product Catalog', slug: 'product-management', icon: Package, desc: 'SKU variants & pricing tiers' },
                        { title: 'Time Off Management', slug: 'time-off-management', icon: CalendarClock, desc: 'Leave requests & approvals' },
                        { title: 'Invoice Management', slug: 'invoice-management', icon: Receipt, desc: 'Automated recurring billing' },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={idx}
                            href={`/modules/${item.slug}`}
                            onClick={closeDropdowns}
                            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                          >
                            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-400 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.title}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('services')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDropdown === 'services'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {activeDropdown === 'services' && (
                <div className="absolute top-full left-0 w-80 pt-2 z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 space-y-1">
                    {[
                      { title: 'Custom ERP Development', href: '/services#custom-development', icon: Code, desc: 'Tailored features for your workflow' },
                      { title: 'ERP Support & Maintenance', href: '/services#support-maintenance', icon: Headphones, desc: '24/7 dedicated engineering SLA' },
                      { title: 'ERP Migration Services', href: '/services#migration', icon: Shuffle, desc: 'Migrate from SAP, Odoo, NetSuite' },
                      { title: 'ERP Integration', href: '/services#integration', icon: Network, desc: 'Connect PowerBI, CRMs & custom APIs' },
                      { title: 'White Label ERP', href: '/services#white-label', icon: Award, desc: 'Rebrand under your corporate identity' },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={closeDropdowns}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-400 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.title}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeDropdown === 'resources'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {activeDropdown === 'resources' && (
                <div className="absolute top-full -left-12 w-80 pt-2 z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 space-y-1">
                    <Link
                      href="/blog"
                      onClick={closeDropdowns}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Blog & Insights</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Tutorials, updates & architecture</p>
                      </div>
                    </Link>

                    <Link
                      href="/docs"
                      onClick={closeDropdowns}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">User Documentation</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Setup guides and workflows</p>
                      </div>
                    </Link>

                    <Link
                      href="/docs/developer-guide"
                      onClick={closeDropdowns}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Dev Documentation</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">REST APIs, SDK & schemas</p>
                      </div>
                    </Link>

                    <Link
                      href="/demo"
                      onClick={closeDropdowns}
                      className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-indigo-600 text-white">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                          Live Interactive Demo
                        </div>
                        <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300">
                          Experience working ERP console
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Link: Contact */}
            <Link
              href="/contact"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/contact'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Version Switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setVersionDropdownOpen(!versionDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <span>{selectedVersion}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {versionDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 text-xs">
                  {['v3.2.0 (Latest)', 'v3.1.0', 'v3.0.0'].map((ver) => (
                    <button
                      key={ver}
                      onClick={() => {
                        setSelectedVersion(ver.split(' ')[0]);
                        setVersionDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200"
                    >
                      <span>{ver}</span>
                      {selectedVersion === ver.split(' ')[0] && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme appearance"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Cart Button with Count Badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* GitHub Stars Link */}
            <a
              href="https://github.com/auraerp/auraerp"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Star</span>
            </a>

            {/* Launch ERP Console Button */}
            <Link
              href="/app"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Launch ERP</span>
            </Link>

            {/* Primary Action Button: Talk to Sales */}
            <button
              onClick={onOpenContact}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            >
              Talk to Sales
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Pricing & Cloud Plans
            </Link>
            <Link
              href="/modules"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Modules (PMS, Inventory, Sales, HR, etc.)
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Enterprise Services
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Documentation
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
            >
              Live Interactive ERP Console
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Blog & Case Studies
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Contact Us
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Launch Aura ERP Console</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full py-2 text-center text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
