import {
  Project,
  Task,
  Timesheet,
  Contact,
  Lead,
  Quotation,
  Invoice,
  POSTransaction,
  PurchaseOrder,
  Warehouse,
  StockItem,
  StockMovement,
  BillOfMaterials,
  ProductionOrder,
  Equipment,
  MaintenanceRequest,
  Employee,
  Department,
  TimeOffRequest,
} from './types';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${DJANGO_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${endpoint}`);
  }
  return res.json();
}

// -------------------------------------------------------------
// PROJECTS & TASKS (PMS)
// -------------------------------------------------------------
export async function getProjects(): Promise<Project[]> {
  try {
    const data = await fetchJson<any>('/api/projects/projects/');
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        code: 'PRJ-GLOBAL-01',
        title: 'Tier-1 Cloud ERP Migration',
        description: 'Multi-region deployment and SAP data ETL.',
        status: 'active',
        progress_percentage: 68,
        start_date: '2026-01-15',
        budget: '75000.00',
        spent: '48200.00',
        tasks_count: 14,
        completed_tasks_count: 9,
      },
    ];
  }
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  return fetchJson<Project>('/api/projects/projects/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getTasks(projectCode?: string): Promise<Task[]> {
  try {
    const url = projectCode ? `/api/projects/tasks/?project=${projectCode}` : '/api/projects/tasks/';
    const data = await fetchJson<any>(url);
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, title: 'Configure PostgreSQL Connection Pooling', project_code: 'PRJ-GLOBAL-01', priority: 'high', status: 'done', estimated_hours: 6, logged_hours: 6 },
      { id: 2, title: 'Implement Model Context Protocol (MCP) sidecar', project_code: 'PRJ-GLOBAL-01', priority: 'urgent', status: 'in_progress', estimated_hours: 12, logged_hours: 8 },
      { id: 3, title: 'WMS Barcode Scanner Bluetooth integration', project_code: 'PRJ-GLOBAL-01', priority: 'medium', status: 'todo', estimated_hours: 8, logged_hours: 0 },
      { id: 4, title: 'Double-entry general ledger reconciliation audit', project_code: 'PRJ-GLOBAL-01', priority: 'high', status: 'review', estimated_hours: 10, logged_hours: 9 },
    ];
  }
}

export async function createTask(payload: Partial<Task>): Promise<Task> {
  return fetchJson<Task>('/api/projects/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId: number, payload: Partial<Task>): Promise<Task> {
  return fetchJson<Task>(`/api/projects/tasks/${taskId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// TIMESHEETS
// -------------------------------------------------------------
export async function getTimesheets(): Promise<Timesheet[]> {
  try {
    const data = await fetchJson<any>('/api/projects/timesheets/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, task: 1, task_title: 'Configure PostgreSQL Pooling', worker_name: 'Alex Rivera', work_date: '2026-10-15', hours: '4.50', notes: 'Completed pgBouncer tuning' },
      { id: 2, task: 2, task_title: 'Implement MCP sidecar', worker_name: 'Sophia Chen', work_date: '2026-10-16', hours: '6.00', notes: 'Auth endpoints mapped' },
    ];
  }
}

export async function createTimesheet(payload: Partial<Timesheet>): Promise<Timesheet> {
  return fetchJson<Timesheet>('/api/projects/timesheets/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// CRM & CONTACTS
// -------------------------------------------------------------
export async function getContacts(): Promise<Contact[]> {
  try {
    const data = await fetchJson<any>('/api/crm/contacts/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, name: 'Acme Global Corp', email: 'procurement@acme.com', phone: '+1 555-0199', company: 'Acme Technologies', job_title: 'Procurement Director', contact_type: 'customer', status: 'active' },
      { id: 2, name: 'Global Hardware Supplies', email: 'vendor@globalsupply.com', phone: '+1 555-7788', company: 'Global Hardware Supplies', job_title: 'Supply Rep', contact_type: 'vendor', status: 'active' },
      { id: 3, name: 'Zenith Logistics', email: 'info@zenithlog.com', phone: '+44 20 7946 0912', company: 'Zenith Global', job_title: 'Operations Head', contact_type: 'partner', status: 'active' },
    ];
  }
}

export async function createContact(payload: Partial<Contact>): Promise<Contact> {
  return fetchJson<Contact>('/api/crm/contacts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getLeads(): Promise<Lead[]> {
  try {
    const data = await fetchJson<any>('/api/crm/leads/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, title: 'Multi-Plant ERP Rollout', contact: 1, contact_name: 'Acme Global Corp', estimated_value: '45000.00', stage: 'negotiation', probability_percentage: 85, source: 'Direct Demo' },
      { id: 2, title: 'Autonomous WMS Integration', contact: 1, contact_name: 'Acme Global Corp', estimated_value: '18000.00', stage: 'proposal', probability_percentage: 60, source: 'Website Inquiry' },
    ];
  }
}

// -------------------------------------------------------------
// SALES, QUOTATIONS & POS
// -------------------------------------------------------------
export async function getQuotations(): Promise<Quotation[]> {
  try {
    const data = await fetchJson<any>('/api/sales/quotes/');
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        quote_number: 'QTN-2026-101',
        customer: 1,
        customer_name: 'Acme Global Technologies',
        issue_date: '2026-10-12',
        valid_until: '2026-11-12',
        status: 'sent',
        subtotal: '48500.00',
        tax: '2425.00',
        total: '50925.00',
        notes: 'Includes 1-year Enterprise SLA.',
      },
    ];
  }
}

export async function createQuotation(payload: Partial<Quotation>): Promise<Quotation> {
  return fetchJson<Quotation>('/api/sales/quotes/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPOSTransactions(): Promise<POSTransaction[]> {
  try {
    const data = await fetchJson<any>('/api/sales/pos/');
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        receipt_number: 'REC-99201',
        cashier_name: 'Sarah Jenkins',
        customer_name: 'Walk-in Retail Client',
        subtotal: '420.00',
        tax: '21.00',
        discount: '0.00',
        total_amount: '441.00',
        amount_tendered: '450.00',
        change_due: '9.00',
        payment_method: 'cash',
        items_data: [
          { name: 'Wireless Handheld Barcode Scanner', qty: 2, price: 120 },
          { name: 'Thermal Receipt Rolls (Box of 20)', qty: 3, price: 60 },
        ],
      },
    ];
  }
}

export async function createPOSTransaction(payload: Partial<POSTransaction>): Promise<POSTransaction> {
  return fetchJson<POSTransaction>('/api/sales/pos/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// PURCHASING & PROCUREMENT
// -------------------------------------------------------------
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const data = await fetchJson<any>('/api/procurement/orders/');
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        po_number: 'PO-2026-001',
        vendor: 2,
        order_date: '2026-10-10',
        expected_date: '2026-10-20',
        status: 'sent',
        subtotal: '12400.00',
        tax: '620.00',
        total: '13020.00',
        notes: 'Priority air freight.',
      },
      {
        id: 2,
        po_number: 'PO-2026-002',
        vendor: 2,
        order_date: '2026-10-05',
        expected_date: '2026-10-15',
        status: 'received',
        subtotal: '28500.00',
        tax: '1425.00',
        total: '29925.00',
        notes: 'Verified against GRN standards.',
      },
    ];
  }
}

export async function createPurchaseOrder(payload: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return fetchJson<PurchaseOrder>('/api/procurement/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePurchaseOrder(poId: number, payload: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return fetchJson<PurchaseOrder>(`/api/procurement/orders/${poId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// INVENTORY & WAREHOUSES
// -------------------------------------------------------------
export async function getWarehouses(): Promise<Warehouse[]> {
  try {
    const data = await fetchJson<any>('/api/inventory/warehouses/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, name: 'North America Distribution Hub', code: 'WH-US-01', location: 'San Jose, CA', capacity_sqft: 45000, is_active: true },
      { id: 2, name: 'European Logistics Terminal', code: 'WH-EU-01', location: 'Frankfurt, Germany', capacity_sqft: 35000, is_active: true },
      { id: 3, name: 'Asia Pacific Center', code: 'WH-AP-01', location: 'Singapore', capacity_sqft: 28000, is_active: true },
    ];
  }
}

export async function getStockItems(warehouseId?: number): Promise<StockItem[]> {
  try {
    const url = warehouseId ? `/api/inventory/stock/?warehouse=${warehouseId}` : '/api/inventory/stock/';
    const data = await fetchJson<any>(url);
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        product: { id: 1, name: 'Cloud ERP Core Instance', slug: 'cloud-core', sku: 'AURA-SRV-01', price: '29.00', stock_quantity: 120, short_description: '', description: '', icon_name: 'Server', features: [], is_featured: true },
        warehouse_name: 'North America Distribution Hub',
        warehouse_code: 'WH-US-01',
        quantity_on_hand: 85,
        quantity_reserved: 12,
        reorder_level: 25,
        available_quantity: 73,
      },
      {
        id: 2,
        product: { id: 2, name: 'Industrial RFID Reader Terminal', slug: 'rfid-reader', sku: 'AURA-HW-88', price: '450.00', stock_quantity: 14, short_description: '', description: '', icon_name: 'Boxes', features: [], is_featured: false },
        warehouse_name: 'North America Distribution Hub',
        warehouse_code: 'WH-US-01',
        quantity_on_hand: 8,
        quantity_reserved: 4,
        reorder_level: 15,
        available_quantity: 4,
      },
    ];
  }
}

export async function createStockMovement(payload: Partial<StockMovement>): Promise<StockMovement> {
  return fetchJson<StockMovement>('/api/inventory/movements/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// MANUFACTURING (MRP)
// -------------------------------------------------------------
export async function getBillOfMaterials(): Promise<BillOfMaterials[]> {
  try {
    const data = await fetchJson<any>('/api/manufacturing/boms/');
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        code: 'BOM-SRV-400',
        name: 'Enterprise Server Appliance Assembly',
        finished_product: 1,
        quantity_produced: 1,
        estimated_cost: '1850.00',
        is_active: true,
        notes: 'Assembly recipe for next-generation on-prem cloud appliance.',
        components: [
          { id: 1, material_name: 'Solid Aluminum 4U Rack Chassis', quantity_required: '1.00', unit_of_measure: 'Units', unit_cost: '350.00' },
          { id: 2, material_name: 'Server Motherboard Dual-Socket', quantity_required: '1.00', unit_of_measure: 'Units', unit_cost: '620.00' },
          { id: 3, material_name: 'DDR5 64GB ECC RAM Modules', quantity_required: '4.00', unit_of_measure: 'Units', unit_cost: '180.00' },
        ],
      },
    ];
  }
}

export async function getProductionOrders(): Promise<ProductionOrder[]> {
  try {
    const data = await fetchJson<any>('/api/manufacturing/production-orders/');
    return data.results || data;
  } catch (e) {
    return [
      {
        id: 1,
        order_number: 'MO-2026-881',
        bom: 1,
        planned_quantity: 25,
        completed_quantity: 18,
        status: 'in_production',
        start_date: '2026-10-12',
        due_date: '2026-10-22',
        assigned_workstation: 'Line 2 - High Reliability Bay',
        notes: 'Motherboard testing in progress.',
      },
    ];
  }
}

export async function updateProductionOrder(moId: number, payload: Partial<ProductionOrder>): Promise<ProductionOrder> {
  return fetchJson<ProductionOrder>(`/api/manufacturing/production-orders/${moId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// MAINTENANCE & ASSETS
// -------------------------------------------------------------
export async function getEquipment(): Promise<Equipment[]> {
  try {
    const data = await fetchJson<any>('/api/maintenance/equipment/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, code: 'EQ-CNC-001', name: 'Haas 5-Axis Precision CNC Machining Center', category: 'Heavy Machinery', location: 'Main Factory Bay B', maintenance_frequency: 'monthly', status: 'operational', next_maintenance_date: '2026-10-25', technician_in_charge: 'Marcus Vance' },
      { id: 2, code: 'EQ-FLT-004', name: 'Toyota Electric Heavy Forklift', category: 'Fleet Vehicle', location: 'Central Hub Bay 4', maintenance_frequency: 'monthly', status: 'under_maintenance', next_maintenance_date: '2026-10-12', technician_in_charge: 'Marcus Vance' },
    ];
  }
}

export async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  try {
    const data = await fetchJson<any>('/api/maintenance/requests/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, ticket_number: 'MTR-2026-041', equipment: 2, title: 'Hydraulic lift cylinder seal inspection', description: 'Slow retraction observed.', priority: 'high', status: 'in_progress', reported_by: 'Dave Martinez', assigned_technician: 'Marcus Vance', scheduled_date: '2026-10-16' },
      { id: 2, ticket_number: 'MTR-2026-042', equipment: 1, title: 'Routine spindle calibration & coolant flush', description: 'Preventive monthly cycle.', priority: 'medium', status: 'open', reported_by: 'Telemetry Service', assigned_technician: 'Marcus Vance', scheduled_date: '2026-10-18' },
    ];
  }
}

export async function createMaintenanceRequest(payload: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
  return fetchJson<MaintenanceRequest>('/api/maintenance/requests/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMaintenanceRequest(reqId: number, payload: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
  return fetchJson<MaintenanceRequest>(`/api/maintenance/requests/${reqId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// HUMAN RESOURCES (HR)
// -------------------------------------------------------------
export async function getEmployees(): Promise<Employee[]> {
  try {
    const data = await fetchJson<any>('/api/hr/employees/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, first_name: 'Liam', last_name: 'Alexander', full_name: 'Liam Alexander', email: 'liam@auraerp.io', job_title: 'VP of Engineering', department_name: 'Engineering & Architecture', hire_date: '2023-01-10', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { id: 2, first_name: 'Elena', last_name: 'Rostova', full_name: 'Elena Rostova', email: 'elena@auraerp.io', job_title: 'Lead Cloud Infrastructure Architect', department_name: 'Cloud Operations', hire_date: '2023-06-15', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { id: 3, first_name: 'Marcus', last_name: 'Vance', full_name: 'Marcus Vance', email: 'marcus@auraerp.io', job_title: 'Director of Supply Chain & MRP', department_name: 'Manufacturing & MRP', hire_date: '2024-02-01', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    ];
  }
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const data = await fetchJson<any>('/api/hr/departments/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, name: 'Engineering & Architecture', code: 'ENG', manager_name: 'Liam Alexander' },
      { id: 2, name: 'Cloud Operations', code: 'OPS', manager_name: 'Elena Rostova' },
      { id: 3, name: 'Manufacturing & MRP', code: 'MFG', manager_name: 'Marcus Vance' },
    ];
  }
}

export async function getTimeOffRequests(): Promise<TimeOffRequest[]> {
  try {
    const data = await fetchJson<any>('/api/hr/timeoffs/');
    return data.results || data;
  } catch (e) {
    return [
      { id: 1, employee: 1, employee_name: 'Liam Alexander', leave_type: 'paid', start_date: '2026-10-24', end_date: '2026-10-26', days_requested: 3, reason: 'Family vacation', status: 'pending' },
      { id: 2, employee: 2, employee_name: 'Elena Rostova', leave_type: 'sick', start_date: '2026-10-14', end_date: '2026-10-15', days_requested: 2, reason: 'Medical appointment', status: 'approved' },
    ];
  }
}

export async function createTimeOffRequest(payload: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
  return fetchJson<TimeOffRequest>('/api/hr/timeoffs/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTimeOffRequest(requestId: number, payload: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
  return fetchJson<TimeOffRequest>(`/api/hr/timeoffs/${requestId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
