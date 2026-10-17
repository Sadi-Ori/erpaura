export interface CompanyProfile {
  name: string;
  tagline: string;
  description: string;
  logo_light: string;
  logo_dark: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  email: string;
  phone: string;
  address: string;
  github_url: string;
  twitter_url: string;
  linkedin_url: string;
  youtube_url: string;
  docs_url: string;
  demo_url: string;
  version: string;
}

export interface AnnouncementBanner {
  id: number;
  headline: string;
  cta_text: string;
  cta_url: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export interface NavigationItem {
  id: number;
  title: string;
  slug: string;
  url: string;
  description: string;
  icon_name: string;
  order: number;
  is_external: boolean;
  children?: NavigationItem[];
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  badge?: string;
  monthly_price: string | number;
  yearly_price: string | number;
  description: string;
  features: string[];
  limits?: Record<string, any>;
  is_popular: boolean;
  order: number;
}

export interface ProductModule {
  id: number;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: string | number;
  compare_at_price?: string | number;
  stock_quantity: number;
  icon_name: string;
  features: string[];
  is_featured: boolean;
}

export interface CartItem {
  id: number;
  product?: ProductModule;
  plan?: PricingPlan;
  quantity: number;
  billing_cycle: 'monthly' | 'yearly';
  unit_price: string | number;
  total_price: string | number;
}

export interface Cart {
  id?: number;
  session_id: string;
  items: CartItem[];
  coupon?: {
    code: string;
    description: string;
    discount_percentage: string | number;
    fixed_discount: string | number;
  };
  subtotal: string | number;
  discount_amount: string | number;
  total: string | number;
}

export interface Order {
  id?: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  billing_address: string;
  subtotal: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_company?: string;
  issue_date: string;
  due_date: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  status: string;
  created_at?: string;
}

export interface Contact {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  contact_type: string;
  status: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface Lead {
  id?: number;
  title: string;
  contact: number;
  contact_name?: string;
  estimated_value: string | number;
  stage: string;
  expected_close_date?: string;
  probability_percentage: number;
  source: string;
}

export interface Project {
  id?: number;
  title: string;
  code: string;
  client_name?: string;
  client?: number;
  description: string;
  status: string;
  progress_percentage: number;
  start_date: string;
  due_date?: string;
  budget: string | number;
  spent: string | number;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Task {
  id?: number;
  project?: number;
  project_code?: string;
  project_title?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority: string;
  status: string;
  estimated_hours: string | number;
  logged_hours: string | number;
  due_date?: string;
}

export interface Timesheet {
  id?: number;
  task: number;
  task_title?: string;
  worker_name: string;
  work_date: string;
  hours: string | number;
  notes?: string;
  created_at?: string;
}

export interface QuotationItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
}

export interface Quotation {
  id?: number;
  quote_number: string;
  customer: number;
  customer_name?: string;
  issue_date: string;
  valid_until?: string;
  status: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  notes?: string;
  items?: QuotationItem[];
  created_at?: string;
}

export interface POSTransaction {
  id?: number;
  receipt_number: string;
  cashier_name: string;
  customer_name: string;
  subtotal: string | number;
  tax: string | number;
  discount: string | number;
  total_amount: string | number;
  amount_tendered: string | number;
  change_due: string | number;
  payment_method: string;
  items_data: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  created_at?: string;
}

export interface PurchaseOrderItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit_cost: string | number;
  total_cost: string | number;
}

export interface PurchaseOrder {
  id?: number;
  po_number: string;
  vendor: number;
  vendor_details?: Contact;
  order_date: string;
  expected_date?: string;
  status: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  notes?: string;
  items?: PurchaseOrderItem[];
  created_at?: string;
}

export interface Warehouse {
  id?: number;
  name: string;
  code: string;
  location: string;
  manager?: string;
  capacity_sqft: number;
  is_active: boolean;
}

export interface StockItem {
  id?: number;
  product: ProductModule;
  warehouse_name: string;
  warehouse_code: string;
  warehouse?: number;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_level: number;
  available_quantity: number;
}

export interface StockMovement {
  id?: number;
  reference_number: string;
  product: number;
  product_name?: string;
  from_warehouse?: number;
  to_warehouse?: number;
  movement_type: string;
  quantity: number;
  notes?: string;
  timestamp?: string;
}

export interface BOMItem {
  id?: number;
  material_name: string;
  quantity_required: string | number;
  unit_of_measure: string;
  unit_cost: string | number;
  total_cost?: string | number;
}

export interface BillOfMaterials {
  id?: number;
  code: string;
  name: string;
  finished_product: number;
  product_details?: ProductModule;
  quantity_produced: number;
  estimated_cost: string | number;
  is_active: boolean;
  notes?: string;
  components?: BOMItem[];
}

export interface ProductionOrder {
  id?: number;
  order_number: string;
  bom: number;
  bom_details?: BillOfMaterials;
  planned_quantity: number;
  completed_quantity: number;
  status: string;
  start_date: string;
  due_date?: string;
  assigned_workstation: string;
  notes?: string;
}

export interface Equipment {
  id?: number;
  code: string;
  name: string;
  category: string;
  serial_number?: string;
  location: string;
  maintenance_frequency: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  status: string;
  technician_in_charge?: string;
  open_requests_count?: number;
}

export interface MaintenanceRequest {
  id?: number;
  ticket_number: string;
  equipment: number;
  equipment_details?: Equipment;
  title: string;
  description: string;
  priority: string;
  status: string;
  reported_by: string;
  assigned_technician?: string;
  scheduled_date: string;
  completion_date?: string;
  notes?: string;
}

export interface Department {
  id?: number;
  name: string;
  code: string;
  description?: string;
  manager_name?: string;
}

export interface Employee {
  id?: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: number;
  department_name?: string;
  job_title: string;
  hire_date: string;
  status: string;
  avatar_url?: string;
}

export interface TimeOffRequest {
  id?: number;
  employee: number;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
  created_at?: string;
}

export interface DocCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  articles: Array<{
    id: number;
    title: string;
    slug: string;
    summary: string;
    version: string;
  }>;
}

export interface DocArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  version: string;
  category: {
    name: string;
    slug: string;
  };
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: string;
  category_name?: string;
  excerpt: string;
  content: string;
  featured_image: string;
  read_time: string;
  is_featured: boolean;
  published_at: string;
}
