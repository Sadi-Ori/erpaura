'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FolderKanban, FileText, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const searchItems = [
  { title: 'Project Management System (PMS)', category: 'Modules', href: '/modules/project-management', icon: FolderKanban },
  { title: 'Inventory & Warehouse Management', category: 'Modules', href: '/modules/inventory-management', icon: Layers },
  { title: 'Sales Management & Invoicing', category: 'Modules', href: '/modules/sales-management', icon: Layers },
  { title: 'HR & Employee Management', category: 'Modules', href: '/modules/employee-management', icon: Layers },
  { title: 'Manufacturing (MRP) Engine', category: 'Modules', href: '/modules/manufacturing-management', icon: Layers },
  { title: 'Point of Sale (POS)', category: 'Modules', href: '/modules/point-of-sale', icon: Layers },
  { title: 'Aura MCP AI Agent Server', category: 'Agent Tools', href: '/docs/mcp', icon: BookOpen },
  { title: 'Agent Autonomous Skills', category: 'Agent Tools', href: '/docs/skills', icon: BookOpen },
  { title: 'Cloud Hosting Pricing & Plans', category: 'Pricing', href: '/pricing', icon: FileText },
  { title: 'Custom ERP Development Services', category: 'Services', href: '/services#custom-development', icon: FileText },
  { title: 'Quickstart Installation Guide', category: 'Docs', href: '/docs/quickstart-installation', icon: BookOpen },
  { title: 'REST API Specification', category: 'Docs', href: '/docs/developer-guide', icon: BookOpen },
  { title: 'Live Interactive ERP Console', category: 'Demo', href: '/demo', icon: FolderKanban },
];

export default function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a module name, doc topic, or feature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching modules or documentation articles found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or click item</span>
          <span>Press ESC to exit</span>
        </div>

      </div>
    </div>
  );
}
