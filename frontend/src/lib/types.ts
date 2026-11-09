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
  category?: string;
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

export interface Milestone {
  id?: number;
  project: number;
  project_code?: string;
  project_title?: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  progress_percentage: number;
  deliverables?: string;
  tasks_count?: number;
  completed_tasks_count?: number;
  created_at?: string;
}

export interface TaskChecklist {
  id?: number;
  task: number;
  title: string;
  is_completed: boolean;
  order: number;
}

export interface TaskComment {
  id?: number;
  task: number;
  author_name: string;
  content: string;
  created_at?: string;
}

export interface Issue {
  id?: number;
  project: number;
  project_code?: string;
  project_title?: string;
  task?: number | null;
  task_title?: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  reported_by: string;
  assigned_to?: string;
  steps_to_reproduce?: string;
  resolution_notes?: string;
  created_at?: string;
  resolved_at?: string | null;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  total_hours_logged: number;
  total_timesheet_cost: number;
  pending_timesheets: number;
  open_issues: number;
  critical_issues: number;
  health_counts: {
    on_track: number;
    at_risk: number;
    delayed: number;
    completed: number;
  };
  total_budget: number;
  total_spent: number;
}

export interface Project {
  id?: number;
  title: string;
  code: string;
  category?: string;
  client_name?: string;
  client?: number;
  manager_name?: string;
  team_size?: number;
  description: string;
  status: string;
  health_status?: string;
  progress_percentage: number;
  start_date: string;
  due_date?: string;
  budget: string | number;
  spent: string | number;
  tasks_count?: number;
  completed_tasks_count?: number;
  open_issues_count?: number;
  milestones_count?: number;
  recent_tasks?: Task[];
}

export interface Task {
  id?: number;
  project?: number;
  project_code?: string;
  project_title?: string;
  milestone?: number | null;
  milestone_title?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  task_type?: string;
  priority: string;
  status: string;
  estimated_hours: string | number;
  logged_hours: string | number;
  tags?: string;
  due_date?: string;
  checklist_items?: TaskChecklist[];
  checklist_count?: number;
  completed_checklist_count?: number;
}

export interface Timesheet {
  id?: number;
  task: number;
  task_title?: string;
  project_code?: string;
  project_title?: string;
  worker_name: string;
  work_date: string;
  hours: string | number;
  is_billable?: boolean;
  hourly_rate?: string | number;
  total_cost?: string | number;
  approval_status?: string;
  approved_by?: string;
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

export interface BinLocation {
  id?: number;
  warehouse: number;
  warehouse_name?: string;
  warehouse_code?: string;
  zone: string;
  aisle: string;
  shelf: string;
  bin_code: string;
  is_occupied: boolean;
}

export interface Warehouse {
  id?: number;
  name: string;
  code: string;
  location: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  manager?: string;
  capacity_sqft: number;
  current_occupancy_pct?: number;
  is_active: boolean;
  bins_count?: number;
  stock_items_count?: number;
  total_valuation?: number;
}

export interface StockItem {
  id?: number;
  product: ProductModule;
  warehouse_name: string;
  warehouse_code: string;
  warehouse?: number;
  bin_location?: number | null;
  bin_code?: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_level: number;
  reorder_quantity?: number;
  unit_cost?: number | string;
  available_quantity: number;
  total_inventory_value?: number;
  is_low_stock?: boolean;
  last_counted_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id?: number;
  reference_number: string;
  product: number;
  product_name?: string;
  product_sku?: string;
  from_warehouse?: number | null;
  from_warehouse_name?: string;
  to_warehouse?: number | null;
  to_warehouse_name?: string;
  movement_type: string;
  quantity: number;
  unit_cost?: number | string;
  performed_by?: string;
  notes?: string;
  timestamp?: string;
}

export interface InventoryStats {
  total_units: number;
  total_valuation: number;
  low_stock_count: number;
  total_warehouses: number;
  total_movements: number;
  warehouses: Array<{
    id: number;
    name: string;
    code: string;
    location: string;
    capacity_sqft: number;
    occupancy_pct: number;
    total_units: number;
    total_valuation: number;
    sku_count: number;
  }>;
}

export interface POSRegister {
  id?: number;
  name: string;
  store_location: string;
  active_cashier: string;
  opening_float: number | string;
  current_cash: number | string;
  is_open: boolean;
  opened_at: string;
  closed_at?: string | null;
  transactions_count?: number;
  total_sales?: number;
}

export interface POSStats {
  total_sales: number;
  transactions_count: number;
  cash_sales: number;
  card_sales: number;
  qr_sales: number;
  avg_basket: number;
  active_register?: POSRegister | null;
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

export interface WorkCenter {
  id?: number;
  code: string;
  name: string;
  category: string;
  hourly_rate: string | number;
  capacity_hours_per_day: string | number;
  is_active: boolean;
  created_at?: string;
}

export interface Activity {
  id?: number;
  contact: number;
  contact_name?: string;
  lead?: number | null;
  lead_title?: string;
  activity_type: 'call' | 'meeting' | 'email' | 'note';
  summary: string;
  details?: string;
  performed_by: string;
  performed_at: string;
}

export interface ProcurementStats {
  total_spend: number;
  total_committed: number;
  total_orders: number;
  draft_count: number;
  sent_count: number;
  received_count: number;
  billed_count: number;
  vendors_count: number;
}

export interface ManufacturingStats {
  total_orders: number;
  planned_count: number;
  in_progress_count: number;
  qa_count: number;
  completed_count: number;
  total_planned_units: number;
  total_completed_units: number;
  boms_count: number;
  workcenters_count: number;
}

export interface MaintenanceStats {
  total_equipment: number;
  operational_count: number;
  under_maintenance_count: number;
  decommissioned_count: number;
  operational_rate: number;
  total_requests: number;
  open_requests: number;
  in_progress_requests: number;
  waiting_parts_requests: number;
  resolved_requests: number;
  critical_requests: number;
}

export interface CRMStats {
  total_pipeline_value: number;
  won_revenue: number;
  total_leads: number;
  won_count: number;
  lost_count: number;
  win_rate: number;
  contacts_count: number;
  customers_count: number;
  prospects_count: number;
  vendors_count: number;
  partners_count: number;
  stage_breakdown: Record<string, { label: string; count: number; total_value: number }>;
}

export interface SalesStats {
  total_revenue: number;
  total_orders: number;
  paid_invoices_amount: number;
  unpaid_invoices_amount: number;
  overdue_count: number;
  total_quotes: number;
  accepted_quotes: number;
  conversion_rate: number;
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
  budget?: number | string;
  location?: string;
  employee_count?: number;
}

export interface Designation {
  id?: number;
  title: string;
  code: string;
  department?: number;
  department_name?: string;
  salary_grade: string;
  description?: string;
}

export interface LeaveBalance {
  id?: number;
  employee?: number;
  year: number;
  annual_quota: number;
  annual_used: number;
  annual_remaining: number;
  sick_quota: number;
  sick_used: number;
  sick_remaining: number;
  casual_quota: number;
  casual_used: number;
  casual_remaining: number;
}

export interface AttendanceRecord {
  id?: number;
  employee: number;
  employee_name?: string;
  employee_id?: string;
  department_name?: string;
  date: string;
  clock_in?: string | null;
  clock_out?: string | null;
  working_hours: number | string;
  late_minutes?: number;
  status: string;
  notes?: string;
  created_at?: string;
}

export interface TimeOffRequest {
  id?: number;
  employee: number;
  employee_name?: string;
  employee_department?: string;
  employee_avatar?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
  manager_comment?: string;
  created_at?: string;
}

export interface PayrollEntry {
  id?: number;
  payslip_number: string;
  employee: number;
  employee_name?: string;
  employee_id?: string;
  employee_job?: string;
  department_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  month: number;
  year: number;
  period_label: string;
  basic_salary: number | string;
  housing_allowance: number | string;
  medical_allowance: number | string;
  transport_allowance: number | string;
  bonus_allowance: number | string;
  tax_deduction: number | string;
  provident_fund: number | string;
  health_insurance: number | string;
  unpaid_leave_deduction: number | string;
  gross_salary: number | string;
  total_deductions: number | string;
  net_salary: number | string;
  status: string;
  payment_method: string;
  disbursed_at?: string | null;
  created_at?: string;
}

export interface PerformanceReview {
  id?: number;
  employee: number;
  employee_name?: string;
  job_title?: string;
  department_name?: string;
  reviewer_name: string;
  review_period: string;
  technical_rating: number;
  communication_rating: number;
  punctuality_rating: number;
  leadership_rating: number;
  overall_rating: number;
  strengths?: string;
  growth_areas?: string;
  comments?: string;
  promotion_recommendation?: string;
  review_date: string;
}

export interface Employee {
  id?: number;
  employee_id?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string;
  department?: number;
  department_name?: string;
  designation?: number;
  designation_title?: string;
  job_title: string;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date: string;
  status: string;
  avatar_url?: string;
  date_of_birth?: string | null;
  gender?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  basic_salary?: number | string;
  salary_currency?: string;
  bank_name?: string;
  bank_account_number?: string;
  tax_id?: string;
  manager_name?: string;
  created_at?: string;
  leave_balance?: LeaveBalance;
  recent_reviews?: PerformanceReview[];
}

export interface HRStats {
  total_employees: number;
  active_employees: number;
  departments_count: number;
  attendance_today: {
    present: number;
    late: number;
    on_leave: number;
  };
  pending_leaves: number;
  approved_leaves: number;
  monthly_payroll_total: number | string;
  disbursed_total: number | string;
  departments: Array<{
    id: number;
    name: string;
    code: string;
    employee_count: number;
    manager_name: string;
  }>;
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

// ==========================================
// Recruitment Management System (RMS) Types
// ==========================================

export interface Subsidiary {
  id: number;
  name: string;
  code: string;
  description: string;
  industry: string;
  country: string;
  city: string;
  website: string;
  is_active: boolean;
  vacancies_count?: number;
}

export interface VacancyQuestion {
  id: number;
  vacancy: number;
  question_text: string;
  question_type: 'text' | 'paragraph' | 'boolean' | 'multiple_choice' | 'number';
  options: string[];
  is_required: boolean;
  order: number;
}

export interface Vacancy {
  id: number;
  title: string;
  vacancy_code: string;
  subsidiary: number;
  subsidiary_name?: string;
  subsidiary_code?: string;
  department?: number | null;
  department_name?: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  required_education: string;
  min_experience_years: number;
  openings_count: number;
  location: string;
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  salary_currency: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  required_skills: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'under_review' | 'shortlisted' | 'interview' | 'closed';
  deadline?: string | null;
  hiring_manager?: number | null;
  hiring_manager_name?: string;
  created_at: string;
  updated_at: string;
  questions?: VacancyQuestion[];
  applications_count?: number;
}

export interface Education {
  id?: number;
  profile?: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year?: number | null;
  is_current?: boolean;
  grade_gpa?: string;
  activities?: string;
}

export interface WorkExperience {
  id?: number;
  profile?: number;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string;
}

export interface ApplicantSkill {
  id?: number;
  profile?: number;
  skill_name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
}

export interface ApplicantProfile {
  id: number;
  user?: number | null;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone: string;
  address: string;
  headline: string;
  bio_summary: string;
  resume_url: string;
  resume_file_name: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  created_at?: string;
  updated_at?: string;
  educations?: Education[];
  experiences?: WorkExperience[];
  skills?: ApplicantSkill[];
}

export interface ApplicationAnswer {
  id: number;
  question: number;
  question_text?: string;
  question_type?: string;
  answer_text: string;
}

export interface InterviewEvaluation {
  id: number;
  interview: number;
  evaluator?: number | null;
  evaluator_name: string;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  cultural_fit_score: number;
  overall_score: number;
  feedback_notes: string;
  recommendation: 'strong_hire' | 'hire' | 'hold' | 'reject';
  submitted_at: string;
}

export interface Interview {
  id: number;
  application: number;
  applicant_name?: string;
  applicant_email?: string;
  vacancy_title?: string;
  application_stage?: string;
  title: string;
  round_type: 'screening' | 'technical' | 'cultural' | 'executive' | 'final';
  interview_type: 'video' | 'phone' | 'in_person';
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location_or_url: string;
  panelist_names: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_notes?: string;
  created_at: string;
  evaluations?: InterviewEvaluation[];
}

export interface RecruitmentNote {
  id: number;
  application: number;
  author?: number | null;
  author_name: string;
  note_text: string;
  is_confidential: boolean;
  created_at: string;
}

export interface JobApplication {
  id: number;
  application_number: string;
  vacancy: number;
  vacancy_title?: string;
  vacancy_code?: string;
  subsidiary_name?: string;
  applicant: number;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  applicant_headline?: string;
  cover_letter: string;
  resume_url: string;
  is_draft: boolean;
  stage: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'selected' | 'not_selected' | 'closed';
  recruiter_rating: number;
  rejection_reason?: string;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  answers?: ApplicationAnswer[];
  interviews?: Interview[];
  notes?: RecruitmentNote[];
  applicant_details?: ApplicantProfile;
}

export interface RecruitmentStats {
  total_vacancies: number;
  published_vacancies: number;
  total_applicants: number;
  total_applications: number;
  stage_counts: {
    draft: number;
    submitted: number;
    under_review: number;
    shortlisted: number;
    interview: number;
    selected: number;
    not_selected: number;
    closed: number;
  };
  scheduled_interviews: number;
  completed_interviews: number;
  subsidiaries: Array<{
    id: number;
    name: string;
    code: string;
    vacancies_count: number;
    active_vacancies: number;
  }>;
}

