'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Clock, Calendar, Share2, Sparkles } from 'lucide-react';
import { getBlogPosts } from '@/lib/api';
import { BlogPost } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

function BlogPostContent({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    getBlogPosts().then((posts) => {
      const found = posts.find((p) => p.slug === slug) || posts[0];
      setPost(found);
    });
  }, [slug]);

  if (!post) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        Loading post...
      </div>
    );
  }

  return (
    <article className="py-16 sm:py-24 bg-white dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Articles</span>
        </Link>

        {/* Post Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {post.category_name}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{post.read_time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{post.published_at}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden mb-10 shadow-md">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-slate-700 dark:text-slate-300 font-normal">
          <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed border-l-4 border-indigo-600 pl-4 py-1 italic">
            "{post.excerpt}"
          </p>

          <div className="space-y-4">
            <p>{post.content}</p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
              Modern Operational Philosophy
            </h3>
            <p>
              By leveraging Django's battle-tested ORM for mission-critical business transactions alongside Next.js reactive frontend state, enterprises gain the best of both worlds: strict ACID compliance for balance sheets and sub-second reactive responsiveness for warehouse operators.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
              Autonomous AI Agent Extensibility
            </h3>
            <p>
              Aura ERP exposes standardized endpoints compliant with the Anthropic Model Context Protocol (MCP). Background agents can verify raw material inventory balances, draft purchase orders to vendors, and trigger dunning sequences without manual intervention.
            </p>
          </div>
        </div>

        {/* Footer Author Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Written by {post.author}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Core Systems Contributor at Aura ERP</p>
            </div>
          </div>

          <Link
            href="/docs"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
          >
            Read Docs
          </Link>
        </div>

      </div>
    </article>
  );
}

export default function SingleBlogPostPage(props: Props) {
  return (
    <React.Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading post...</div>}>
      <BlogPostContent {...props} />
    </React.Suspense>
  );
}
