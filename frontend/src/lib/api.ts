import {
  CompanyProfile,
  AnnouncementBanner,
  NavigationItem,
  FAQItem,
  PricingPlan,
  ProductModule,
  Cart,
  Order,
  Invoice,
  Contact,
  Project,
  Task,
  StockItem,
  Employee,
  DocCategory,
  DocArticle,
  BlogPost,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Helper for fetching with error catching & graceful fallback
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      console.warn(`API request to ${endpoint} returned status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    // Django server might be offline or initializing
    return null;
  }
}

// 1. Site Configuration
export async function getSiteConfig(): Promise<{
  company: CompanyProfile;
  banner: AnnouncementBanner | null;
  navigation: NavigationItem[];
}> {
  const data = await fetchAPI<{
    company: CompanyProfile;
    banner: AnnouncementBanner | null;
    navigation: NavigationItem[];
  }>('/core/config/');

  if (data) return data;

  // High fidelity default fallback
  return {
    company: {
      name: 'Aura ERP',
      tagline: 'Next-Generation Open Source ERP Platform Built to Scale Your Business',
      description: 'Aura ERP is an open-source, modular enterprise platform engineered with a modern Django backend and Next.js frontend to automate accounting, supply chain, CRM, HR, and manufacturing operations.',
      logo_light: '/images/logo-light.svg',
      logo_dark: '/images/logo-dark.svg',
      primary_color: '#6366F1',
      secondary_color: '#10B981',
      accent_color: '#06B6D4',
      email: 'support@auraerp.io',
      phone: '+1 (888) 287-2377',
      address: '100 Innovation Boulevard, Suite 500, Tech Park, San Francisco, CA 94107',
      github_url: 'https://github.com/auraerp/auraerp',
      twitter_url: 'https://x.com/AuraERP',
      linkedin_url: 'https://linkedin.com/company/auraerp',
      youtube_url: 'https://youtube.com/@AuraERP',
      docs_url: '/docs',
      demo_url: '/demo',
      version: 'v3.2.0',
    },
    banner: {
      id: 1,
      headline: 'Aura Cloud: $29/Month. One ERP. Your Entire Enterprise',
      cta_text: 'Aura Cloud Hosting',
      cta_url: '/pricing',
      background_color: '#4F46E5',
      text_color: '#FFFFFF',
      is_active: true,
    },
    navigation: [],
  };
}

// 2. FAQs
export async function getFAQs(): Promise<FAQItem[]> {
  const data = await fetchAPI<{ results: FAQItem[] } | FAQItem[]>('/core/faqs/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      question: 'What is Aura ERP?',
      answer: 'Aura ERP is an open-source, modular enterprise platform engineered with a robust Django backend and a blazing-fast Next.js frontend. It empowers companies to orchestrate accounting, inventory, supply chain, CRM, human resources, and project management in one unified cloud ecosystem.',
      category: 'General',
      order: 1,
    },
    {
      id: 2,
      question: 'Who can benefit from using Aura ERP?',
      answer: 'Aura ERP is tailored for fast-growing startups, Small and Medium Enterprises (SMEs), and large enterprises across manufacturing, wholesale, professional services, retail, and tech. Its modular architecture ensures you only enable the modules you need.',
      category: 'General',
      order: 2,
    },
    {
      id: 3,
      question: 'How customizable is Aura ERP?',
      answer: 'Because Aura ERP is 100% open source under the MIT license, you have complete code access. You can customize Django models, add custom API endpoints, create custom Next.js UI components, and integrate AI agent tools like Model Context Protocol (MCP).',
      category: 'Technical',
      order: 3,
    },
    {
      id: 4,
      question: 'How does Aura ERP maintain data security and compliance?',
      answer: 'Aura ERP implements industry standard cryptographic encryption (AES-256 for data at rest, TLS 1.3 in transit), strict role-based access control (RBAC), multi-factor authentication, granular audit trails, and alignments with ISO 27001, GDPR, and SOC 2 Type II compliance.',
      category: 'Security',
      order: 4,
    },
    {
      id: 5,
      question: 'Can Aura ERP integrate with third-party software and legacy databases?',
      answer: 'Yes. Aura ERP features comprehensive RESTful APIs, OpenAPI/Swagger specifications, webhook triggers, and pre-built connectors for popular tools like PowerBI, Stripe, Slack, Salesforce, and modern AI LLM agents.',
      category: 'Integrations',
      order: 5,
    },
    {
      id: 6,
      question: 'What is the difference between Community and Cloud Hosting?',
      answer: 'The Community Edition is free forever, self-hosted on your own infrastructure with total control. The Cloud Hosting plan ($29/month) is fully managed on high-availability cloud servers with automated daily backups, SSL, continuous upgrades, and priority SLA support.',
      category: 'Pricing',
      order: 6,
    },
  ];
}

// 3. Contact Inquiries
export async function submitContactInquiry(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
}) {
  const res = await fetch(`${API_BASE}/core/contact/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit contact enquiry');
  }
  return await res.json();
}

// 4. Products / Modules
export async function getProducts(featured?: boolean): Promise<ProductModule[]> {
  const url = featured ? '/products/items/?featured=true' : '/products/items/';
  const data = await fetchAPI<{ results: ProductModule[] } | ProductModule[]>(url);
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      name: 'Project Management System (PMS)',
      slug: 'project-management',
      sku: 'AURA-MOD-01',
      short_description: 'Plan projects, track milestones, assign tasks, and visualize Kanban sprint workflows.',
      description: 'Streamline project delivery with intuitive Kanban boards, Gantt timeline tracking, milestone dependencies, and real-time team workload balancing.',
      price: '19.00',
      compare_at_price: '39.00',
      stock_quantity: 999,
      icon_name: 'FolderKanban',
      features: ['Interactive Kanban task board', 'Gantt timeline visualization', 'Milestone & stage tracking', 'Team workload balancer'],
      is_featured: true,
    },
    {
      id: 2,
      name: 'Inventory & Warehouse Management',
      slug: 'inventory-management',
      sku: 'AURA-MOD-02',
      short_description: 'Real-time multi-location warehouse operations, barcode scanning, and auto-reordering.',
      description: 'Stay on top of stock movements across all distribution centers, locations, and shelves with automated min/max safety threshold alerts.',
      price: '25.00',
      compare_at_price: '49.00',
      stock_quantity: 999,
      icon_name: 'Boxes',
      features: ['Multi-warehouse stock tracking', 'Batch & serial number traceability', 'Automated reorder triggers', 'Stock movement ledger'],
      is_featured: true,
    },
    {
      id: 3,
      name: 'Sales & Invoicing Pipeline',
      slug: 'sales-management',
      sku: 'AURA-MOD-03',
      short_description: 'Convert quotations into confirmed orders, automate recurring invoices, and track payments.',
      description: 'Full revenue automation: dispatch digital quotations, accept online payments, manage tiered customer pricing, and automate recurring billing cycles.',
      price: '22.00',
      compare_at_price: '45.00',
      stock_quantity: 999,
      icon_name: 'Receipt',
      features: ['Quotation generator with PDF export', 'Automated recurring subscription billing', 'Credit card & wire payment gateway', 'Customer balance statements'],
      is_featured: true,
    },
    {
      id: 4,
      name: 'HR & Employee Management',
      slug: 'employee-management',
      sku: 'AURA-MOD-04',
      short_description: 'Complete workforce directory, contracts, leave approvals, and employee performance reviews.',
      description: 'Effortlessly oversee personnel files, role allocations, department budgets, paid time off requests, and recruitment candidate pipelines.',
      price: '18.00',
      compare_at_price: '35.00',
      stock_quantity: 999,
      icon_name: 'Users',
      features: ['Employee database & organizational chart', 'Paid time off (PTO) request workflow', 'Department budget allocation', 'Attendance & digital check-in'],
      is_featured: true,
    },
    {
      id: 5,
      name: 'Procurement & Purchase Orders',
      slug: 'purchase-order',
      sku: 'AURA-MOD-05',
      short_description: 'Simplify procurement, track RFQs, vendor invoices, and 3-way matching.',
      description: 'Modernize supplier relationships: issue Requests for Quotations, evaluate supplier bids, create purchase orders, and verify warehouse receipts.',
      price: '20.00',
      compare_at_price: '40.00',
      stock_quantity: 999,
      icon_name: 'ShoppingBag',
      features: ['Request for Quotation (RFQ) distribution', 'Vendor performance scorecard', 'Automated 3-way invoice matching', 'Purchase order approval hierarchies'],
      is_featured: true,
    },
    {
      id: 6,
      name: 'Manufacturing & MRP Engine',
      slug: 'manufacturing-management',
      sku: 'AURA-MOD-06',
      short_description: 'Multi-level Bills of Materials (BOM), work orders, operations routing, and shop floor timers.',
      description: 'Coordinate production lines, schedule work centers, monitor component availability, and track labor duration across manufacturing stages.',
      price: '35.00',
      compare_at_price: '69.00',
      stock_quantity: 999,
      icon_name: 'Factory',
      features: ['Multi-tier Bill of Materials (BOM)', 'Work center capacity planning', 'Routing & labor step tracking', 'Scrap & production yield analysis'],
      is_featured: true,
    },
    {
      id: 7,
      name: 'Point of Sale (POS) Cashier Register',
      slug: 'point-of-sale',
      sku: 'AURA-MOD-07',
      short_description: 'Blazing fast in-store checkout with touch interface, barcode scanning, and offline sync.',
      description: 'Run retail checkouts, scan barcodes, handle split payments, issue digital receipts, and automatically reconcile registers with cloud inventory.',
      price: '24.00',
      compare_at_price: '49.00',
      stock_quantity: 999,
      icon_name: 'Store',
      features: ['Touchscreen-optimized cashier UI', 'Barcode & QR code scanner support', 'Split tenders & cash drawer control', 'Offline cache with automatic cloud sync'],
      is_featured: true,
    },
    {
      id: 8,
      name: 'Customer Relationship Management (CRM)',
      slug: 'contact-management',
      sku: 'AURA-MOD-08',
      short_description: 'Track prospect pipeline from initial lead to contract negotiation and deal closure.',
      description: 'Convert leads faster with visual stage tracking, interaction history, call notes, automated email sequences, and revenue forecasting.',
      price: '21.00',
      compare_at_price: '42.00',
      stock_quantity: 999,
      icon_name: 'TrendingUp',
      features: ['Visual drag-and-drop deal pipeline', 'Lead scoring & automated assignment', 'Call notes & activity logging', 'Revenue forecasting dashboard'],
      is_featured: true,
    },
  ];
}

// 5. Pricing Plans
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const data = await fetchAPI<{ results: PricingPlan[] } | PricingPlan[]>('/products/plans/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      name: 'Community Open-Source',
      slug: 'community',
      monthly_price: '0.00',
      yearly_price: '0.00',
      badge: 'Free Forever',
      description: 'Ideal for developers and self-hosted deployments with complete source code access.',
      features: [
        'Full open-source source code (MIT License)',
        'All 15 core ERP modules included',
        'Unlimited self-hosted users',
        'Community Discord & GitHub support',
        'Self-managed database & updates',
        'RESTful API access',
      ],
      limits: { users: 'Unlimited', storage: 'Self-hosted', support: 'Community' },
      is_popular: false,
      order: 1,
    },
    {
      id: 2,
      name: 'Cloud Starter',
      slug: 'cloud-starter',
      monthly_price: '29.00',
      yearly_price: '290.00',
      badge: 'Special Offer 🎉',
      description: 'Fully managed high-performance cloud ERP for small growing businesses.',
      features: [
        'One-click managed cloud setup on custom domain',
        'Automated nightly encrypted offsite backups',
        'Free SSL certificate & DDoS protection',
        'Up to 15 active enterprise user seats',
        '100 GB ultra-fast NVMe storage',
        'Email & ticket support with 24h SLA',
        'Automatic rolling security updates',
      ],
      limits: { users: 15, storage: '100 GB NVMe', support: '24h SLA' },
      is_popular: true,
      order: 2,
    },
    {
      id: 3,
      name: 'Enterprise Pro',
      slug: 'enterprise-pro',
      monthly_price: '89.00',
      yearly_price: '890.00',
      badge: 'High Growth',
      description: 'Scalable multi-company multi-warehouse cloud for expanding operations.',
      features: [
        'Everything in Cloud Starter',
        'Unlimited user seats & role hierarchies',
        'Multi-company & multi-currency consolidation',
        'Dedicated isolated PostgreSQL & Redis cluster',
        'AI Agent & MCP Tooling integration',
        '500 GB NVMe storage & 99.99% uptime SLA',
        'Priority 2-hour response SLA support',
      ],
      limits: { users: 'Unlimited', storage: '500 GB NVMe', support: '2-hour Priority SLA' },
      is_popular: false,
      order: 3,
    },
    {
      id: 4,
      name: 'Custom Dedicated Scale',
      slug: 'custom-scale',
      monthly_price: '249.00',
      yearly_price: '2490.00',
      badge: 'Enterprise Custom',
      description: 'Air-gapped on-premise or sovereign cloud with tailored custom modules.',
      features: [
        'Everything in Enterprise Pro',
        'Custom code & bespoke module development',
        'White-label branding & custom domain IP',
        'Dedicated solutions architect & account manager',
        'Custom ERP migration from SAP, Odoo, NetSuite',
        'SOC 2 Type II compliance audit reports',
        '24/7/365 live phone support & dedicated Slack channel',
      ],
      limits: { users: 'Unlimited', storage: 'Dedicated TB+', support: '24/7 Dedicated Slack' },
      is_popular: false,
      order: 4,
    },
  ];
}

// 6. Cart Management
export async function getCart(sessionId: string): Promise<Cart> {
  const data = await fetchAPI<{ cart: Cart }>(`/sales/cart/?session_id=${sessionId}`);
  if (data?.cart) return data.cart;

  return {
    session_id: sessionId,
    items: [],
    subtotal: '0.00',
    discount_amount: '0.00',
    total: '0.00',
  };
}

export async function addToCart(payload: {
  session_id: string;
  plan_id?: number;
  product_id?: number;
  quantity?: number;
  billing_cycle?: 'monthly' | 'yearly';
}) {
  const res = await fetch(`${API_BASE}/sales/cart/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function applyCoupon(sessionId: string, code: string) {
  const res = await fetch(`${API_BASE}/sales/cart/apply-coupon/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, code }),
  });
  return await res.json();
}

export async function checkoutOrder(payload: {
  session_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  billing_address?: string;
  payment_method?: string;
}) {
  const res = await fetch(`${API_BASE}/sales/checkout/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

// 7. Live Operational Demo Endpoints
export async function getLiveInvoices(): Promise<Invoice[]> {
  const data = await fetchAPI<{ results: Invoice[] } | Invoice[]>('/sales/invoices/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      invoice_number: 'INV-2026-0089',
      customer_name: 'Sarah Jenkins',
      customer_email: 'sarah.j@acmecorp.com',
      customer_company: 'Acme Global Industries',
      issue_date: '2026-10-15',
      due_date: '2026-11-15',
      subtotal: '89.00',
      tax: '4.45',
      total: '93.45',
      status: 'paid',
    },
    {
      id: 2,
      invoice_number: 'INV-2026-0090',
      customer_name: 'David Chen',
      customer_email: 'dchen@nexuslogistics.io',
      customer_company: 'Nexus Logistics Group',
      issue_date: '2026-10-16',
      due_date: '2026-11-16',
      subtotal: '249.00',
      tax: '12.45',
      total: '261.45',
      status: 'paid',
    },
  ];
}

export async function getLiveContacts(): Promise<Contact[]> {
  const data = await fetchAPI<{ results: Contact[] } | Contact[]>('/crm/contacts/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      name: 'Sarah Jenkins',
      email: 'sarah.j@acmecorp.com',
      phone: '+1 (415) 890-1234',
      company: 'Acme Global Industries',
      job_title: 'VP of Operations',
      contact_type: 'customer',
      status: 'active',
    },
    {
      id: 2,
      name: 'David Chen',
      email: 'dchen@nexuslogistics.io',
      phone: '+1 (212) 555-7890',
      company: 'Nexus Logistics Group',
      job_title: 'Chief Technology Officer',
      contact_type: 'lead',
      status: 'negotiation',
    },
    {
      id: 3,
      name: 'Helena Rostova',
      email: 'h.rostova@nordictech.se',
      phone: '+46 8 123 4567',
      company: 'Nordic Precision AB',
      job_title: 'Procurement Director',
      contact_type: 'customer',
      status: 'active',
    },
  ];
}

export async function getLiveProjects(): Promise<Project[]> {
  const data = await fetchAPI<{ results: Project[] } | Project[]>('/projects/projects/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      title: 'Nexus Logistics Global ERP Migration',
      code: 'PRJ-NEXUS-01',
      client_name: 'Nexus Logistics Group',
      description: 'Full system overhaul replacing legacy SAP R/3 with Aura ERP cloud cluster.',
      status: 'active',
      progress_percentage: 65,
      start_date: '2026-08-15',
      due_date: '2026-11-30',
      budget: '75000.00',
      spent: '48500.00',
      tasks_count: 8,
      completed_tasks_count: 5,
    },
    {
      id: 2,
      title: 'Acme Manufacturing Work Order Automation',
      code: 'PRJ-ACME-02',
      client_name: 'Acme Global Industries',
      description: 'Deploying shop floor tablet interfaces for real-time BOM and work order logging.',
      status: 'active',
      progress_percentage: 40,
      start_date: '2026-09-10',
      due_date: '2026-12-15',
      budget: '42000.00',
      spent: '16800.00',
      tasks_count: 6,
      completed_tasks_count: 2,
    },
  ];
}

export async function getLiveStock(): Promise<StockItem[]> {
  const data = await fetchAPI<{ results: StockItem[] } | StockItem[]>('/inventory/stock/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      product: {
        id: 1,
        name: 'Project Management System (PMS)',
        slug: 'project-management',
        sku: 'AURA-MOD-01',
        short_description: '',
        description: '',
        price: '19.00',
        stock_quantity: 350,
        icon_name: 'FolderKanban',
        features: [],
        is_featured: true,
      },
      warehouse_name: 'Primary West Distribution Center',
      warehouse_code: 'WH-WEST-01',
      quantity_on_hand: 350,
      quantity_reserved: 25,
      reorder_level: 50,
      available_quantity: 325,
    },
    {
      id: 2,
      product: {
        id: 2,
        name: 'Inventory & Warehouse Management',
        slug: 'inventory-management',
        sku: 'AURA-MOD-02',
        short_description: '',
        description: '',
        price: '25.00',
        stock_quantity: 180,
        icon_name: 'Boxes',
        features: [],
        is_featured: true,
      },
      warehouse_name: 'East Coast Logistics Hub',
      warehouse_code: 'WH-EAST-02',
      quantity_on_hand: 180,
      quantity_reserved: 10,
      reorder_level: 30,
      available_quantity: 170,
    },
  ];
}

export async function getLiveEmployees(): Promise<Employee[]> {
  const data = await fetchAPI<{ results: Employee[] } | Employee[]>('/hr/employees/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      first_name: 'Alexander',
      last_name: 'Reed',
      full_name: 'Alexander Reed',
      email: 'a.reed@auraerp.io',
      department_name: 'Engineering & Infrastructure',
      job_title: 'Principal Systems Architect',
      hire_date: '2023-04-15',
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: 2,
      first_name: 'Maya',
      last_name: 'Lin',
      full_name: 'Maya Lin',
      email: 'm.lin@auraerp.io',
      department_name: 'Engineering & Infrastructure',
      job_title: 'Staff Frontend Engineer',
      hire_date: '2023-08-01',
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
    {
      id: 3,
      first_name: 'Jessica',
      last_name: 'Sterling',
      full_name: 'Jessica Sterling',
      email: 'j.sterling@auraerp.io',
      department_name: 'Enterprise Sales & Solutions',
      job_title: 'VP of Global Sales',
      hire_date: '2022-11-10',
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  ];
}

// 8. Documentation
export async function getDocCategories(): Promise<DocCategory[]> {
  const data = await fetchAPI<{ results: DocCategory[] } | DocCategory[]>('/docs/categories/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Initial installation, setup guides, and quickstart tutorials.',
      icon: 'BookOpen',
      order: 1,
      articles: [
        { id: 1, title: 'Introduction to Aura ERP', slug: 'introduction', summary: 'Overview of architecture and design philosophy.', version: 'v3.x' },
        { id: 2, title: 'Quickstart Installation Guide', slug: 'quickstart-installation', summary: 'Step-by-step instructions to launch locally.', version: 'v3.x' },
      ],
    },
    {
      id: 2,
      name: 'Modules Reference',
      slug: 'modules-reference',
      description: 'Deep dive into every operational module and business logic.',
      icon: 'Layers',
      order: 2,
      articles: [
        { id: 3, title: 'Project Management (PMS) Guide', slug: 'pms-guide', summary: 'Kanban boards, tasks, milestones, and timesheets.', version: 'v3.x' },
        { id: 4, title: 'Inventory & Multi-Warehouse Tracking', slug: 'inventory-guide', summary: 'Stock moves, reorder thresholds, and bin locations.', version: 'v3.x' },
      ],
    },
    {
      id: 3,
      name: 'Agent Tools & AI (MCP)',
      slug: 'ai-mcp',
      description: 'Autonomous agents, Model Context Protocol, and workflow skills.',
      icon: 'Bot',
      order: 3,
      articles: [
        { id: 5, title: 'Aura Model Context Protocol (MCP)', slug: 'mcp', summary: 'Connect AI assistants directly to live ERP records.', version: 'v3.x' },
        { id: 6, title: 'Autonomous ERP Agent Skills', slug: 'skills', summary: 'Deploy background automated actions and alerts.', version: 'v3.x' },
      ],
    },
    {
      id: 4,
      name: 'REST API & Architecture',
      slug: 'api-architecture',
      description: 'API endpoints, authentication, schemas, and webhooks.',
      icon: 'Code',
      order: 4,
      articles: [
        { id: 7, title: 'RESTful API Specification', slug: 'api-spec', summary: 'Comprehensive endpoints for all enterprise data.', version: 'v3.x' },
      ],
    },
  ];
}

export async function getDocArticle(slug: string): Promise<DocArticle | null> {
  const data = await fetchAPI<DocArticle>(`/docs/articles/${slug}/`);
  if (data) return data;

  const docs = await getDocCategories();
  for (const cat of docs) {
    const found = cat.articles.find((a) => a.slug === slug);
    if (found) {
      return {
        id: found.id,
        title: found.title,
        slug: found.slug,
        summary: found.summary,
        version: found.version,
        category: { name: cat.name, slug: cat.slug },
        updated_at: '2026-10-15',
        content: `# ${found.title}\n\n${found.summary}\n\n## Overview\nAura ERP provides enterprise-grade reliability, customizable workflows, and real-time synchronization between the Django REST backend and the Next.js modern frontend interface.\n\n### Code Example\n\`\`\`python\n# Django View Example\nfrom rest_framework.views import APIView\nfrom rest_framework.response import Response\n\nclass SystemHealthCheck(APIView):\n    def get(self, request):\n        return Response({"status": "healthy", "engine": "Django 6.0"})\n\`\`\`\n\n### Deployment Checklist\n- Ensure Python 3.12+ and Django are running on port 8000\n- Next.js development server active on port 3000\n- Database migrations and seed scripts executed successfully\n`,
      };
    }
  }
  return null;
}

// 9. Blog Posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  const data = await fetchAPI<{ results: BlogPost[] } | BlogPost[]>('/blog/posts/');
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;

  return [
    {
      id: 1,
      title: 'Why We Rebuilt the Enterprise ERP Stack with Django and Next.js',
      slug: 'why-django-nextjs-erp',
      author: 'Alexander Reed',
      category_name: 'Engineering & Architecture',
      excerpt: 'Legacy monoliths make custom workflows painful. Here is how combining Django hardened ORM with Next.js modern UI creates the ultimate ERP experience.',
      content: 'In today fast-moving business environment, companies can no longer afford rigid ERP systems that take 18 months to deploy and millions of dollars to maintain. By coupling Django 6.0 REST APIs with Next.js 15, Aura ERP offers rock-solid transactional integrity and lightning-fast page loads.',
      featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      read_time: '6 min read',
      is_featured: true,
      published_at: '2026-10-14',
    },
    {
      id: 2,
      title: 'How Nexus Logistics Cut Inventory Discrepancies by 94% with Aura ERP',
      slug: 'nexus-logistics-case-study',
      author: 'Jessica Sterling',
      category_name: 'Case Studies',
      excerpt: 'Discover how a multinational logistics provider transformed multi-warehouse transfers and achieved real-time barcode accuracy.',
      content: 'Nexus Logistics operates over 100,000 square feet of fulfillment facilities across North America and Europe. Prior to adopting Aura ERP, tracking stock movements across regions relied on manual spreadsheets and delayed daily batch syncs. With Aura ERP real-time inventory ledger and barcode integration, stock discrepancy dropped from 8.2% to under 0.4% in the first 90 days.',
      featured_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      read_time: '4 min read',
      is_featured: false,
      published_at: '2026-10-12',
    },
    {
      id: 3,
      title: 'Introducing Model Context Protocol (MCP) in Aura ERP: AI Agents for Business',
      slug: 'introducing-mcp-ai-agents',
      author: 'Maya Lin',
      category_name: 'Product Announcements',
      excerpt: 'Connect autonomous LLM agents directly to live ERP records to draft purchase orders, verify inventory, and answer team queries instantly.',
      content: 'AI should not be a separate chat box isolated from your corporate data. With Aura ERP native Model Context Protocol support, agents can safely query real-time stock levels, draft invoices, and verify supplier contracts with granular role-based permissions.',
      featured_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      read_time: '5 min read',
      is_featured: false,
      published_at: '2026-10-10',
    },
  ];
}
