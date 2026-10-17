'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  Code,
  Check,
  Copy,
  ExternalLink,
  Search,
} from 'lucide-react';
import { GithubIcon } from '@/components/BrandIcons';
import { getDocCategories, getDocArticle } from '@/lib/api';
import { DocCategory, DocArticle } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

function DocArticleContent({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [article, setArticle] = useState<DocArticle | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchDocQuery, setSearchDocQuery] = useState('');

  useEffect(() => {
    getDocCategories().then((cats) => {
      setCategories(cats);
    });

    getDocArticle(slug).then((art) => {
      if (art) {
        setArticle(art);
      } else {
        // Fallback article generator
        setArticle({
          id: 99,
          title: slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          slug,
          summary: `Comprehensive documentation guide for ${slug} in Aura ERP.`,
          content: `# ${slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}

Welcome to the official developer documentation for Aura ERP.

## Key Capabilities
- **Modular Data Architecture**: Built on Django 6.0 REST Framework and Next.js 15.
- **Role-Based Security**: Comprehensive granular access controls.
- **RESTful Endpoints**: Complete JSON API coverage.

### Quick Command Reference
\`\`\`bash
# Start backend server
python manage.py runserver 8000

# Start frontend application
npm run dev
\`\`\`

## System Requirements
Ensure Python 3.12+ and Node.js 18+ are configured in your development environment.
`,
          version: 'v3.2.0',
          category: { name: 'Documentation', slug: 'docs' },
          updated_at: '2026-10-15',
        });
      }
    });
  }, [slug]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Docs Category Sidebar (Col 3) */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            
            {/* Docs Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter articles..."
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category Groups */}
            <nav className="space-y-6">
              {categories.map((cat) => {
                const filteredArticles = cat.articles.filter((a) =>
                  a.title.toLowerCase().includes(searchDocQuery.toLowerCase())
                );

                if (searchDocQuery && filteredArticles.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span>{cat.name}</span>
                    </h4>

                    <ul className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                      {filteredArticles.map((art) => {
                        const isActive = art.slug === slug;
                        return (
                          <li key={art.id}>
                            <Link
                              href={`/docs/${art.slug}`}
                              className={`block py-1.5 text-xs transition-colors rounded-r-md pl-1 ${
                                isActive
                                  ? 'font-bold text-indigo-600 dark:text-indigo-400 -ml-[14px] pl-3 border-l-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {art.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/demo"
                className="block p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-center hover:bg-indigo-100 transition-colors"
              >
                Launch Interactive Demo →
              </Link>
            </div>
          </aside>

          {/* Center Column: Documentation Article Reader (Col 7) */}
          <main className="lg:col-span-7 space-y-6 min-w-0">
            {article ? (
              <div className="space-y-6">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Link href="/docs" className="hover:text-slate-600">Documentation</Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>{article.category?.name || 'Guides'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{article.title}</span>
                </div>

                {/* Article Header */}
                <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      {article.version || 'v3.2.0'}
                    </span>
                    <span className="text-xs text-slate-400">Updated: {article.updated_at || 'October 2026'}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {article.title}
                  </h1>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {article.summary}
                  </p>
                </div>

                {/* Article Body Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                  <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                    {article.content}
                  </div>
                </div>

                {/* Interactive Code Snippet Box */}
                <div className="rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 overflow-hidden text-xs">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400">Terminal Command</span>
                    <button
                      onClick={() => handleCopy('git clone https://github.com/auraerp/auraerp.git && cd auraerp')}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto font-mono text-[11px] text-emerald-400 leading-relaxed">
                    <code>git clone https://github.com/auraerp/auraerp.git{'\n'}cd auraerp{'\n'}python -m venv venv && pip install -r backend/requirements.txt{'\n'}python backend/manage.py runserver 8000</code>
                  </pre>
                </div>

                {/* Footer Links for Article */}
                <div className="pt-8 mt-12 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <a
                    href="https://github.com/auraerp/auraerp"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>Edit this page on GitHub</span>
                  </a>

                  <span>Documentation licensed under MIT</span>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Loading documentation article...
              </div>
            )}
          </main>

          {/* Right Column: On this page (Table of Contents) (Col 2) */}
          <aside className="hidden lg:block lg:col-span-2 space-y-3 lg:sticky lg:top-24 text-xs">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 dark:text-slate-500">
              On this page
            </h5>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
              <li><a href="#overview" className="hover:text-indigo-600 block py-0.5">Overview & Purpose</a></li>
              <li><a href="#features" className="hover:text-indigo-600 block py-0.5">Key Capabilities</a></li>
              <li><a href="#api" className="hover:text-indigo-600 block py-0.5">REST API Reference</a></li>
              <li><a href="#deployment" className="hover:text-indigo-600 block py-0.5">Deployment Steps</a></li>
            </ul>

            <div className="pt-6">
              <span className="text-[10px] text-slate-400 block mb-1">Community Support</span>
              <a
                href="https://github.com/auraerp/auraerp/issues"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Report an issue</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function DocArticlePage(props: Props) {
  return (
    <React.Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading documentation...</div>}>
      <DocArticleContent {...props} />
    </React.Suspense>
  );
}
