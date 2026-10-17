"""
Comprehensive Seed Data Script for Aura ERP
Populates realistic, production-ready enterprise data across all modules.
"""
import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from django.contrib.auth.models import User
from apps.core.models import CompanyProfile, AnnouncementBanner, NavigationItem, FAQItem
from apps.products.models import Category, Product, PricingPlan
from apps.sales.models import Coupon, Order, OrderItem, Invoice
from apps.inventory.models import Warehouse, StockItem, StockMovement
from apps.crm.models import Contact, Lead, RecruitmentApplicant
from apps.projects.models import Project, Task, Timesheet
from apps.hr.models import Department, Employee, TimeOffRequest
from apps.docs.models import DocCategory, DocArticle
from apps.blog.models import BlogCategory, BlogPost


def seed_all():
    print("🚀 Seeding Aura ERP database...")

    # 1. Admin Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@auraerp.io', 'admin123')
        print("✓ Created Superuser: admin / admin123")

    # 2. Company Profile
    CompanyProfile.objects.all().delete()
    profile = CompanyProfile.objects.create(
        name="Aura ERP",
        tagline="Next-Generation Open Source ERP Platform Built to Scale Your Business",
        description="Aura ERP is an open-source, modular enterprise platform engineered with modern Django backend and Next.js frontend to automate accounting, supply chain, CRM, HR, and manufacturing operations.",
        primary_color="#6366F1",
        secondary_color="#10B981",
        accent_color="#06B6D4",
        email="support@auraerp.io",
        phone="+1 (888) 287-2377",
        address="100 Innovation Boulevard, Suite 500, Tech Park, San Francisco, CA 94107",
        github_url="https://github.com/auraerp/auraerp",
        twitter_url="https://x.com/AuraERP",
        linkedin_url="https://linkedin.com/company/auraerp",
        youtube_url="https://youtube.com/@AuraERP",
        docs_url="/docs",
        demo_url="/demo",
        version="v3.2.0"
    )
    print("✓ Created Company Profile")

    # 3. Announcement Banner
    AnnouncementBanner.objects.all().delete()
    AnnouncementBanner.objects.create(
        headline="Aura Cloud: $29/Month. One ERP. Your Entire Enterprise",
        cta_text="Aura Cloud Hosting",
        cta_url="/pricing",
        background_color="#4F46E5",
        text_color="#FFFFFF",
        is_active=True
    )
    print("✓ Created Announcement Banner")

    # 4. Navigation Items
    NavigationItem.objects.all().delete()
    
    # Root: Pricing
    NavigationItem.objects.create(
        title="Pricing", slug="pricing", url="/pricing", order=1
    )

    # Root: Agent Tools
    nav_agent = NavigationItem.objects.create(
        title="Agent Tools", slug="agent-tools", url="#", order=2
    )
    NavigationItem.objects.create(
        title="Aura MCP Server", slug="aura-mcp", url="/docs/mcp",
        description="Connect AI assistants (Claude, Copilot, Antigravity) directly to Aura ERP data",
        icon_name="Cpu", parent=nav_agent, order=1
    )
    NavigationItem.objects.create(
        title="Agent Skills", slug="agent-skills", url="/docs/skills",
        description="Autonomous ERP skills for automated actions, invoicing, and reporting",
        icon_name="Sparkles", parent=nav_agent, order=2
    )

    # Root: Modules
    nav_modules = NavigationItem.objects.create(
        title="Modules", slug="modules", url="/modules", order=3
    )
    modules_data = [
        ("Project Management", "project-management", "/modules/project-management", "FolderKanban", "Plan projects, milestones, sprints, and task boards."),
        ("Employee Management", "employee-management", "/modules/employee-management", "Users", "Manage workforce profiles, roles, and departmental hierarchies."),
        ("Recruitment System", "recruitment-management", "/modules/recruitment-management", "Briefcase", "Streamline applicant pipelines, interviews, and candidate ratings."),
        ("Inventory Management", "inventory-management", "/modules/inventory-management", "Boxes", "Track real-time stock levels, multi-warehouse transfers, and reorder alerts."),
        ("Contact Management", "contact-management", "/modules/contact-management", "BookUser", "Organize customer, vendor, and partner records seamlessly."),
        ("Purchase Order", "purchase-order", "/modules/purchase-order", "ShoppingBag", "Procurement workflows, RFQs, vendor receipts, and bills."),
        ("Sales Management", "sales-management", "/modules/sales-management", "TrendingUp", "Quotations, sales orders, automated pipeline, and customer billing."),
        ("Point of Sale (POS)", "point-of-sale", "/modules/point-of-sale", "Store", "Fast retail cashier registers, barcode scanning, and split payments."),
        ("Blog Management", "blog-management", "/modules/blog-management", "FileText", "Publish articles, announcements, and rich case studies."),
        ("Product Management", "product-management", "/modules/product-management", "Package", "Manage SKU catalogs, variants, pricing tiers, and digital downloads."),
        ("Time Off Management", "time-off-management", "/modules/time-off-management", "CalendarClock", "Employee vacation requests, leave approvals, and holiday calendar."),
        ("Website Management", "website-management", "/modules/website-management", "Globe", "Integrated visual CMS to update customer-facing portals."),
        ("Invoice Management", "invoice-management", "/modules/invoice-management", "Receipt", "Automated recurring billing, payment gateways, and tax calculation."),
        ("Accounting Management", "accounting-management", "/modules/accounting-management", "Calculator", "General ledger, journal entries, balance sheet, and P&L reports."),
        ("Manufacturing (MRP)", "manufacturing-management", "/modules/manufacturing-management", "Factory", "Bills of Materials (BOM), work centers, operations, and shop floor tracking."),
    ]
    for idx, (title, slug, url, icon, desc) in enumerate(modules_data, 1):
        NavigationItem.objects.create(
            title=title, slug=slug, url=url, icon_name=icon, description=desc,
            parent=nav_modules, order=idx
        )

    # Root: Services
    nav_services = NavigationItem.objects.create(
        title="Services", slug="services", url="/services", order=4
    )
    services_data = [
        ("Custom ERP Development", "custom-erp-development", "/services#custom-development", "Code", "Tailored enterprise features built for your exact workflow."),
        ("ERP Support & Maintenance", "erp-support-maintenance", "/services#support-maintenance", "Headphones", "24/7 dedicated SLA engineering support and security patches."),
        ("ERP Migration Services", "erp-migration", "/services#migration", "Shuffle", "Seamless data extraction and transition from legacy ERP systems."),
        ("ERP Integration", "erp-integration", "/services#integration", "Network", "Bi-directional connectors for Salesforce, SAP, PowerBI, and custom APIs."),
        ("White Label ERP", "white-label-erp", "/services#white-label", "Award", "Rebrand Aura ERP under your own corporate identity and domain."),
    ]
    for idx, (title, slug, url, icon, desc) in enumerate(services_data, 1):
        NavigationItem.objects.create(
            title=title, slug=slug, url=url, icon_name=icon, description=desc,
            parent=nav_services, order=idx
        )

    # Root: Resources
    nav_resources = NavigationItem.objects.create(
        title="Resources", slug="resources", url="#", order=5
    )
    resources_data = [
        ("Blog & Insights", "blog", "/blog", "BookOpen", "Expert ERP tutorials, system design guides, and engineering news."),
        ("Documentation", "docs", "/docs", "FileCode2", "Comprehensive user guides, configuration walkthroughs, and setups."),
        ("Dev Documentation", "devdocs", "/docs/developer-guide", "Terminal", "Complete REST API reference, plugin architecture, and SDK."),
        ("Knowledgebase", "knowledgebase", "/docs/knowledgebase", "HelpCircle", "Troubleshooting guides and frequently asked answers."),
        ("Live Interactive Demo", "demo", "/demo", "PlayCircle", "Test-drive the live Aura ERP console with real operational data."),
    ]
    for idx, (title, slug, url, icon, desc) in enumerate(resources_data, 1):
        NavigationItem.objects.create(
            title=title, slug=slug, url=url, icon_name=icon, description=desc,
            parent=nav_resources, order=idx
        )
    print("✓ Created Hierarchical Navigation Items")

    # 5. FAQs
    FAQItem.objects.all().delete()
    faqs_data = [
        ("What is Aura ERP?", "Aura ERP is an open-source, modular enterprise platform engineered with a robust Django backend and a blazing-fast Next.js frontend. It empowers companies to orchestrate accounting, inventory, supply chain, CRM, human resources, and project management in one unified cloud ecosystem.", "General", 1),
        ("Who can benefit from using Aura ERP?", "Aura ERP is tailored for fast-growing startups, Small and Medium Enterprises (SMEs), and large enterprises across manufacturing, wholesale, professional services, retail, and tech. Its modular architecture ensures you only enable the modules you need.", "General", 2),
        ("How customizable is Aura ERP?", "Because Aura ERP is 100% open source under the MIT license, you have complete code access. You can customize Django models, add custom API endpoints, create custom Next.js UI components, and integrate AI agent tools like Model Context Protocol (MCP).", "Technical", 3),
        ("How does Aura ERP maintain data security and compliance?", "Aura ERP implements industry standard cryptographic encryption (AES-256 for data at rest, TLS 1.3 in transit), strict role-based access control (RBAC), multi-factor authentication, granular audit trails, and alignments with ISO 27001, GDPR, and SOC 2 Type II compliance.", "Security", 4),
        ("Can Aura ERP integrate with third-party software and legacy databases?", "Yes. Aura ERP features comprehensive RESTful APIs, OpenAPI/Swagger specifications, webhook triggers, and pre-built connectors for popular tools like PowerBI, Stripe, Slack, Salesforce, and modern AI LLM agents.", "Integrations", 5),
        ("What is the difference between Community and Cloud Hosting?", "The Community Edition is free forever, self-hosted on your own infrastructure with total control. The Cloud Hosting plan ($29/month) is fully managed on high-availability cloud servers with automated daily backups, SSL, continuous upgrades, and priority SLA support.", "Pricing", 6),
    ]
    for q, a, cat, order in faqs_data:
        FAQItem.objects.create(question=q, answer=a, category=cat, order=order)
    print("✓ Created FAQ Items")

    # 6. Pricing Plans & Cloud Hosting
    PricingPlan.objects.all().delete()
    plans_data = [
        {
            "name": "Community Open-Source",
            "slug": "community",
            "monthly_price": Decimal("0.00"),
            "yearly_price": Decimal("0.00"),
            "badge": "Free Forever",
            "description": "Ideal for developers and self-hosted deployments with complete source code access.",
            "features": [
                "Full open-source source code (MIT License)",
                "All 15 core ERP modules included",
                "Unlimited self-hosted users",
                "Community Discord & GitHub support",
                "Self-managed database & updates",
                "RESTful API access",
            ],
            "limits": {"users": "Unlimited", "storage": "Self-hosted", "support": "Community"},
            "is_popular": False,
            "order": 1,
        },
        {
            "name": "Cloud Starter",
            "slug": "cloud-starter",
            "monthly_price": Decimal("29.00"),
            "yearly_price": Decimal("290.00"),
            "badge": "Special Offer 🎉",
            "description": "Fully managed high-performance cloud ERP for small growing businesses.",
            "features": [
                "One-click managed cloud setup on custom domain",
                "Automated nightly encrypted offsite backups",
                "Free SSL certificate & DDoS protection",
                "Up to 15 active enterprise user seats",
                "100 GB ultra-fast NVMe storage",
                "Email & ticket support with 24h SLA",
                "Automatic rolling security updates",
            ],
            "limits": {"users": 15, "storage": "100 GB NVMe", "support": "24h SLA"},
            "is_popular": True,
            "order": 2,
        },
        {
            "name": "Enterprise Pro",
            "slug": "enterprise-pro",
            "monthly_price": Decimal("89.00"),
            "yearly_price": Decimal("890.00"),
            "badge": "High Growth",
            "description": "Scalable multi-company multi-warehouse cloud for expanding operations.",
            "features": [
                "Everything in Cloud Starter",
                "Unlimited user seats & role hierarchies",
                "Multi-company & multi-currency consolidation",
                "Dedicated isolated PostgreSQL & Redis cluster",
                "AI Agent & MCP Tooling integration",
                "500 GB NVMe storage & 99.99% uptime SLA",
                "Priority 2-hour response SLA support",
            ],
            "limits": {"users": "Unlimited", "storage": "500 GB NVMe", "support": "2-hour Priority SLA"},
            "is_popular": False,
            "order": 3,
        },
        {
            "name": "Custom Dedicated Scale",
            "slug": "custom-scale",
            "monthly_price": Decimal("249.00"),
            "yearly_price": Decimal("2490.00"),
            "badge": "Enterprise Custom",
            "description": "Air-gapped on-premise or sovereign cloud with tailored custom modules.",
            "features": [
                "Everything in Enterprise Pro",
                "Custom code & bespoke module development",
                "White-label branding & custom domain IP",
                "Dedicated solutions architect & account manager",
                "Custom ERP migration from SAP, Odoo, NetSuite",
                "SOC 2 Type II compliance audit reports",
                "24/7/365 live phone support & dedicated Slack channel",
            ],
            "limits": {"users": "Unlimited", "storage": "Dedicated TB+", "support": "24/7 Dedicated Slack"},
            "is_popular": False,
            "order": 4,
        },
    ]
    for p in plans_data:
        PricingPlan.objects.create(**p)
    print("✓ Created Pricing Plans")

    # 7. Categories & Products (Modules)
    Category.objects.all().delete()
    Product.objects.all().delete()

    cat_modules = Category.objects.create(name="Core ERP Modules", slug="core-modules", description="Individual installable enterprise business modules", icon="Layers", order=1)
    cat_cloud = Category.objects.create(name="Cloud Hosting & Subscriptions", slug="cloud-hosting", description="Fully managed cloud hosting packages", icon="Cloud", order=2)
    cat_services = Category.objects.create(name="Implementation Services", slug="services", description="Professional integration and custom engineering", icon="Wrench", order=3)

    products_data = [
        ("Project Management System (PMS)", "pms-module", "AURA-MOD-01", cat_modules, Decimal("19.00"), Decimal("39.00"), "Plan projects, track milestones, assign tasks, and visualize Kanban sprint workflows.", ["Interactive Kanban task board", "Gantt timeline visualization", "Milestone & stage tracking", "Team workload balancer"], "FolderKanban", True),
        ("Inventory & Warehouse Management", "inventory-module", "AURA-MOD-02", cat_modules, Decimal("25.00"), Decimal("49.00"), "Real-time multi-location warehouse operations, barcode scanning, and auto-reordering.", ["Multi-warehouse stock tracking", "Batch & serial number traceability", "Automated reorder triggers", "Stock movement ledger"], "Boxes", True),
        ("Sales & Invoicing Pipeline", "sales-module", "AURA-MOD-03", cat_modules, Decimal("22.00"), Decimal("45.00"), "Convert quotations into confirmed orders, automate recurring invoices, and track payments.", ["Quotation generator with PDF export", "Automated recurring subscription billing", "Credit card & wire payment gateway", "Customer balance statements"], "Receipt", True),
        ("HR & Employee Management", "hr-module", "AURA-MOD-04", cat_modules, Decimal("18.00"), Decimal("35.00"), "Complete workforce directory, contracts, leave approvals, and employee performance reviews.", ["Employee database & organizational chart", "Paid time off (PTO) request workflow", "Department budget allocation", "Attendance & digital check-in"], "Users", True),
        ("Procurement & Purchase Orders", "purchase-module", "AURA-MOD-05", cat_modules, Decimal("20.00"), Decimal("40.00"), "Simplify procurement, track RFQs, vendor invoices, and 3-way matching.", ["Request for Quotation (RFQ) distribution", "Vendor performance scorecard", "Automated 3-way invoice matching", "Purchase order approval hierarchies"], "ShoppingBag", True),
        ("Manufacturing & MRP Engine", "manufacturing-module", "AURA-MOD-06", cat_modules, Decimal("35.00"), Decimal("69.00"), "Multi-level Bills of Materials (BOM), work orders, operations routing, and shop floor timers.", ["Multi-tier Bill of Materials (BOM)", "Work center capacity planning", "Routing & labor step tracking", "Scrap & production yield analysis"], "Factory", True),
        ("Point of Sale (POS) Cashier Register", "pos-module", "AURA-MOD-07", cat_modules, Decimal("24.00"), Decimal("49.00"), "Blazing fast in-store checkout with touch interface, barcode scanning, and offline sync.", ["Touchscreen-optimized cashier UI", "Barcode & QR code scanner support", "Split tenders & cash drawer control", "Offline cache with automatic cloud sync"], "Store", True),
        ("Customer Relationship Management (CRM)", "crm-module", "AURA-MOD-08", cat_modules, Decimal("21.00"), Decimal("42.00"), "Track prospect pipeline from initial lead to contract negotiation and deal closure.", ["Visual drag-and-drop deal pipeline", "Lead scoring & automated assignment", "Call notes & activity logging", "Revenue forecasting dashboard"], "TrendingUp", True),
    ]

    for name, slug, sku, cat, price, comp, short_desc, feats, icon, feat in products_data:
        Product.objects.create(
            name=name, slug=slug, sku=sku, category=cat,
            price=price, compare_at_price=comp, short_description=short_desc,
            description=short_desc + " Engineered for seamless integration with the Aura ERP ecosystem.",
            features=feats, icon_name=icon, is_featured=feat, stock_quantity=999
        )
    print("✓ Created Products & ERP Modules")

    # 8. Coupons
    Coupon.objects.all().delete()
    Coupon.objects.create(code="AURA2026", description="Launch Special 20% Off", discount_percentage=Decimal("20.00"), is_active=True)
    Coupon.objects.create(code="WELCOME50", description="$50 Off Cloud Hosting", fixed_discount=Decimal("50.00"), is_active=True)
    Coupon.objects.create(code="ENTERPRISE", description="Enterprise Tier 15% Off", discount_percentage=Decimal("15.00"), is_active=True)
    print("✓ Created Promotional Coupons")

    # 9. Warehouses & Inventory
    Warehouse.objects.all().delete()
    wh_main = Warehouse.objects.create(name="Primary West Distribution Center", code="WH-WEST-01", location="San Francisco, CA", manager="Elena Vance", capacity_sqft=45000)
    wh_east = Warehouse.objects.create(name="East Coast Logistics Hub", code="WH-EAST-02", location="Newark, NJ", manager="Marcus Sterling", capacity_sqft=35000)
    wh_eu = Warehouse.objects.create(name="European Fulfillment Depot", code="WH-EU-03", location="Amsterdam, Netherlands", manager="Sophie Dubois", capacity_sqft=28000)

    StockItem.objects.all().delete()
    for prod in Product.objects.all()[:4]:
        StockItem.objects.create(product=prod, warehouse=wh_main, quantity_on_hand=350, quantity_reserved=25, reorder_level=50)
        StockItem.objects.create(product=prod, warehouse=wh_east, quantity_on_hand=180, quantity_reserved=10, reorder_level=30)
    
    StockMovement.objects.all().delete()
    StockMovement.objects.create(
        reference_number="MOV-2026-001", product=Product.objects.first(),
        from_warehouse=wh_main, to_warehouse=wh_east, movement_type="transfer",
        quantity=50, notes="Rebalancing stock ahead of Q4 enterprise rollouts."
    )
    print("✓ Created Warehouses & Stock Levels")

    # 10. CRM Contacts & Leads
    Contact.objects.all().delete()
    c1 = Contact.objects.create(name="Sarah Jenkins", email="sarah.j@acmecorp.com", phone="+1 (415) 890-1234", company="Acme Global Industries", job_title="VP of Operations", contact_type="customer", status="active", address="100 Mission St, San Francisco, CA")
    c2 = Contact.objects.create(name="David Chen", email="dchen@nexuslogistics.io", phone="+1 (212) 555-7890", company="Nexus Logistics Group", job_title="Chief Technology Officer", contact_type="lead", status="negotiation", address="45 Broadway, New York, NY")
    c3 = Contact.objects.create(name="Helena Rostova", email="h.rostova@nordictech.se", phone="+46 8 123 4567", company="Nordic Precision AB", job_title="Procurement Director", contact_type="customer", status="active", address="Kungsgatan 12, Stockholm, Sweden")

    Lead.objects.all().delete()
    Lead.objects.create(title="500-User Enterprise Cloud ERP Rollout", contact=c2, estimated_value=Decimal("48000.00"), stage="proposal", probability_percentage=75, expected_close_date=date.today() + timedelta(days=30))
    Lead.objects.create(title="Custom Manufacturing MRP Integration", contact=c1, estimated_value=Decimal("25000.00"), stage="negotiation", probability_percentage=90, expected_close_date=date.today() + timedelta(days=15))

    RecruitmentApplicant.objects.all().delete()
    RecruitmentApplicant.objects.create(full_name="Alexander Reed", email="a.reed@engineer.net", phone="+1 (555) 345-6789", position="Lead Python/Django Systems Architect", experience_years=7, stage="technical")
    RecruitmentApplicant.objects.create(full_name="Maya Lin", email="maya.lin@frontend.io", phone="+1 (555) 789-0123", position="Senior Next.js / React UI Specialist", experience_years=5, stage="screening")
    print("✓ Created CRM Contacts, Leads, and Applicants")

    # 11. Projects, Tasks & Timesheets (PMS)
    Project.objects.all().delete()
    p1 = Project.objects.create(
        title="Nexus Logistics Global ERP Migration",
        code="PRJ-NEXUS-01", client=c2,
        description="Full system overhaul replacing legacy SAP R/3 with Aura ERP cloud cluster.",
        status="active", progress_percentage=65,
        start_date=date.today() - timedelta(days=60),
        due_date=date.today() + timedelta(days=45),
        budget=Decimal("75000.00"), spent=Decimal("48500.00")
    )
    p2 = Project.objects.create(
        title="Acme Manufacturing Work Order Automation",
        code="PRJ-ACME-02", client=c1,
        description="Deploying shop floor tablet interfaces for real-time BOM and work order logging.",
        status="active", progress_percentage=40,
        start_date=date.today() - timedelta(days=30),
        due_date=date.today() + timedelta(days=60),
        budget=Decimal("42000.00"), spent=Decimal("16800.00")
    )

    Task.objects.all().delete()
    t1 = Task.objects.create(project=p1, title="Configure multi-currency exchange rates API", assigned_to="Alexander Reed", priority="high", status="done", estimated_hours=16.0, logged_hours=14.5)
    t2 = Task.objects.create(project=p1, title="Data cleansing & customer balance migration", assigned_to="Maya Lin", priority="urgent", status="in_progress", estimated_hours=24.0, logged_hours=18.0)
    t3 = Task.objects.create(project=p2, title="Work Center barcode tablet scanning UI", assigned_to="Alexander Reed", priority="high", status="in_progress", estimated_hours=20.0, logged_hours=8.0)

    Timesheet.objects.all().delete()
    Timesheet.objects.create(task=t1, worker_name="Alexander Reed", work_date=date.today() - timedelta(days=2), hours=Decimal("7.5"), notes="Completed OpenExchangeRates webhook connector.")
    Timesheet.objects.create(task=t2, worker_name="Maya Lin", work_date=date.today() - timedelta(days=1), hours=Decimal("8.0"), notes="Validated 4,200 account records in staging database.")
    print("✓ Created PMS Projects, Tasks, and Timesheets")

    # 12. HR Departments & Employees
    Department.objects.all().delete()
    d_eng = Department.objects.create(name="Engineering & Infrastructure", code="ENG", manager_name="Dmitri Volkov")
    d_sales = Department.objects.create(name="Enterprise Sales & Solutions", code="SLS", manager_name="Jessica Sterling")
    d_ops = Department.objects.create(name="Supply Chain & Operations", code="OPS", manager_name="Marcus Vance")

    Employee.objects.all().delete()
    e1 = Employee.objects.create(first_name="Alexander", last_name="Reed", email="a.reed@auraerp.io", department=d_eng, job_title="Principal Systems Architect", hire_date=date(2023, 4, 15), status="active")
    e2 = Employee.objects.create(first_name="Maya", last_name="Lin", email="m.lin@auraerp.io", department=d_eng, job_title="Staff Frontend Engineer", hire_date=date(2023, 8, 1), status="active")
    e3 = Employee.objects.create(first_name="Jessica", last_name="Sterling", email="j.sterling@auraerp.io", department=d_sales, job_title="VP of Global Sales", hire_date=date(2022, 11, 10), status="active")

    TimeOffRequest.objects.all().delete()
    TimeOffRequest.objects.create(employee=e2, leave_type="paid", start_date=date.today() + timedelta(days=14), end_date=date.today() + timedelta(days=18), days_requested=5, reason="Family summer holiday", status="approved")
    print("✓ Created HR Departments, Employees, and Time Off Requests")

    # 13. Documentation Articles
    DocCategory.objects.all().delete()
    DocArticle.objects.all().delete()

    dc_start = DocCategory.objects.create(name="Getting Started", slug="getting-started", description="Initial installation, setup guides, and quickstart tutorials.", icon="BookOpen", order=1)
    dc_modules = DocCategory.objects.create(name="Modules Reference", slug="modules-reference", description="Deep dive into every operational module and business logic.", icon="Layers", order=2)
    dc_ai = DocCategory.objects.create(name="Agent Tools & AI (MCP)", slug="ai-mcp", description="Autonomous agents, Model Context Protocol, and workflow skills.", icon="Bot", order=3)
    dc_api = DocCategory.objects.create(name="REST API & Architecture", slug="api-architecture", description="API endpoints, authentication, schemas, and webhooks.", icon="Code", order=4)

    DocArticle.objects.create(
        category=dc_start, title="Introduction to Aura ERP", slug="introduction", order=1,
        summary="Overview of Aura ERP architecture, design philosophy, and technology stack.",
        content="""# Introduction to Aura ERP

Aura ERP is an open-source Enterprise Resource Planning platform designed to manage modern business operations from a single pane of glass.

## Key Pillars
- **Unified Engine**: Powered by Python 3.12, Django 6.0, and Django REST Framework.
- **Modern Experience**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.
- **Modular Autonomy**: Enable only the business modules you need.
- **AI Agent Ready**: Native support for Anthropic Model Context Protocol (MCP) and automated AI skills.

## Architecture Highlights
Aura ERP separates concerns between enterprise business rules (handled via Django ORM and REST APIs) and user interfaces (handled via responsive, performant Next.js server and client components).
"""
    )
    DocArticle.objects.create(
        category=dc_start, title="Quickstart Installation Guide", slug="quickstart-installation", order=2,
        summary="Step-by-step instructions to clone, configure, and launch Aura ERP locally.",
        content="""# Quickstart Installation Guide

Follow these steps to run Aura ERP on your local workstation.

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### 1. Backend Setup (Django)
```bash
cd backend
python -m venv venv
# Windows:
venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python seed_data.py
python manage.py runserver 8000
```

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with Aura ERP!
"""
    )
    DocArticle.objects.create(
        category=dc_ai, title="Aura ERP Model Context Protocol (MCP)", slug="mcp", order=1,
        summary="Connect AI coding assistants and LLM agents directly to live Aura ERP records.",
        content="""# Model Context Protocol (MCP) Integration

Aura ERP exposes dedicated MCP server tools allowing AI agents (like Claude Desktop, Google Antigravity, and GitHub Copilot) to inspect inventory, trigger purchase orders, create invoices, and draft quotations automatically.

### Supported MCP Tools:
- `get_stock_level`: Check quantities on hand by SKU or warehouse.
- `create_invoice`: Generate draft invoices with line items and customer lookup.
- `list_active_projects`: Inspect active project milestones and task completion.
- `search_contacts`: Find customers and vendors across all business units.
"""
    )
    DocArticle.objects.create(
        category=dc_ai, title="Autonomous ERP Agent Skills", slug="skills", order=2,
        summary="Deploy autonomous scheduled skills for automated reconciliation and inventory alerts.",
        content="""# Agent Skills for ERP Workflows

Skills allow background agents to run recurring checks, perform 3-way matching between purchase orders and vendor bills, and alert procurement leads when stock drops below minimum safety thresholds.
"""
    )
    print("✓ Created Documentation Categories & Articles")

    # 14. Blog Posts
    BlogCategory.objects.all().delete()
    BlogPost.objects.all().delete()

    bc_news = BlogCategory.objects.create(name="Product Announcements", slug="announcements")
    bc_case = BlogCategory.objects.create(name="Case Studies", slug="case-studies")
    bc_eng = BlogCategory.objects.create(name="Engineering & Architecture", slug="engineering")

    BlogPost.objects.create(
        title="Why We Rebuilt the Enterprise ERP Stack with Django and Next.js",
        slug="why-django-nextjs-erp",
        category=bc_eng,
        author="Alexander Reed",
        excerpt="Legacy monoliths make custom workflows painful. Here is how combining Django's hardened ORM with Next.js modern UI creates the ultimate ERP experience.",
        content="""In today's fast-moving business environment, companies can no longer afford rigid ERP systems that take 18 months to deploy and millions of dollars to maintain.

By coupling Django 6.0 REST APIs with Next.js 15, Aura ERP offers:
1. Rock-solid transactional integrity with ACID compliance.
2. Lightning-fast page loads and responsive data tables.
3. Complete modular extensibility.
""",
        read_time="6 min read",
        is_featured=True,
        is_published=True
    )
    BlogPost.objects.create(
        title="How Nexus Logistics Cut Inventory Discrepancies by 94% with Aura ERP",
        slug="nexus-logistics-case-study",
        category=bc_case,
        author="Jessica Sterling",
        excerpt="Discover how a multinational logistics provider transformed multi-warehouse transfers and achieved real-time barcode accuracy.",
        content="""Nexus Logistics operates over 100,000 square feet of fulfillment facilities across North America and Europe. Prior to adopting Aura ERP, tracking stock movements across regions relied on manual spreadsheets and delayed daily batch syncs.

With Aura ERP's real-time inventory ledger and barcode integration, stock discrepancy dropped from 8.2% to under 0.4% in the first 90 days.
""",
        read_time="4 min read",
        is_featured=False,
        is_published=True
    )
    print("✓ Created Blog Posts & Case Studies")

    # 15. Sample Orders and Invoices
    Order.objects.all().delete()
    Invoice.objects.all().delete()

    sample_order = Order.objects.create(
        order_number="AURA-8921-X",
        customer_name="Sarah Jenkins",
        customer_email="sarah.j@acmecorp.com",
        customer_phone="+1 (415) 890-1234",
        company_name="Acme Global Industries",
        billing_address="100 Mission St, San Francisco, CA 94105",
        subtotal=Decimal("89.00"),
        discount_amount=Decimal("0.00"),
        tax_amount=Decimal("4.45"),
        total_amount=Decimal("93.45"),
        payment_method="credit_card",
        status="paid"
    )
    OrderItem.objects.create(
        order=sample_order,
        item_name="Cloud Starter ERP (Monthly Subscription)",
        quantity=1,
        unit_price=Decimal("89.00"),
        total_price=Decimal("89.00")
    )
    Invoice.objects.create(
        invoice_number="INV-2026-0089",
        order=sample_order,
        customer_name="Sarah Jenkins",
        customer_email="sarah.j@acmecorp.com",
        customer_company="Acme Global Industries",
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=30),
        subtotal=Decimal("89.00"),
        tax=Decimal("4.45"),
        total=Decimal("93.45"),
        status="paid"
    )
    print("✓ Created Sample Invoices & Orders")

    print("\n🎉 Aura ERP database seeding completed successfully!")


if __name__ == '__main__':
    seed_all()
