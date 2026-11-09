import {
  Warehouse,
  BinLocation,
  StockItem,
  StockMovement,
  InventoryStats,
  POSTransaction,
  POSRegister,
  POSStats,
  ProductModule,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`API error on ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`API fetch failed on ${endpoint}:`, err);
    return null;
  }
}

// 1. Warehouses
export async function getWarehouses(): Promise<Warehouse[]> {
  const data = await fetchAPI<any>('/inventory/warehouses/');
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getWarehouse(id: number | string): Promise<Warehouse | null> {
  return await fetchAPI<Warehouse>(`/inventory/warehouses/${id}/`);
}

export async function getWarehouseStocks(warehouseId: number | string): Promise<StockItem[]> {
  const data = await fetchAPI<any>(`/inventory/warehouses/${warehouseId}/stocks/`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

// 2. Stock Items
export async function getStockItems(params?: {
  warehouse?: number | string;
  low_stock?: boolean;
  search?: string;
}): Promise<StockItem[]> {
  const query = new URLSearchParams();
  if (params?.warehouse) query.set('warehouse', String(params.warehouse));
  if (params?.low_stock) query.set('low_stock', 'true');
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchAPI<any>(`/inventory/stock/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function adjustStockItem(id: number | string, data: {
  new_quantity: number;
  reason?: string;
  performed_by?: string;
}): Promise<any> {
  return await fetchAPI<any>(`/inventory/stock/${id}/adjust_stock/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 3. Stock Movements
export async function getStockMovements(params?: {
  warehouse?: number | string;
  type?: string;
}): Promise<StockMovement[]> {
  const query = new URLSearchParams();
  if (params?.warehouse) query.set('warehouse', String(params.warehouse));
  if (params?.type) query.set('type', params.type);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchAPI<any>(`/inventory/movements/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createStockTransfer(data: {
  product: number;
  from_warehouse: number;
  to_warehouse: number;
  quantity: number;
  notes?: string;
  performed_by?: string;
}): Promise<any> {
  return await fetchAPI<any>('/inventory/movements/transfer/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 4. Inventory Stats
export async function getInventoryStats(): Promise<InventoryStats | null> {
  return await fetchAPI<InventoryStats>('/inventory/stats/');
}

// 5. Products for POS
export async function getProductsForPOS(): Promise<ProductModule[]> {
  const data = await fetchAPI<any>('/products/');
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

// 6. POS Terminal & Transactions
export async function getPOSStats(): Promise<POSStats | null> {
  return await fetchAPI<POSStats>('/sales/pos-stats/');
}

export async function getPOSTransactions(): Promise<POSTransaction[]> {
  const data = await fetchAPI<any>('/sales/pos/');
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function processPOSCheckout(data: {
  cashier_name?: string;
  customer_name?: string;
  payment_method: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  amount_tendered?: number;
  items: Array<{
    id?: number;
    product_id?: number;
    name: string;
    price: number;
    quantity: number;
  }>;
}): Promise<any> {
  return await fetchAPI<any>('/sales/pos/process_checkout/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function closePOSShift(registerId: number | string, closingCash?: number): Promise<any> {
  return await fetchAPI<any>(`/sales/pos-registers/${registerId}/close_shift/`, {
    method: 'POST',
    body: JSON.stringify({ closing_cash: closingCash }),
  });
}

export async function openPOSShift(registerId: number | string, openingCash?: number): Promise<any> {
  return await fetchAPI<any>(`/sales/pos-registers/${registerId}/open_shift/`, {
    method: 'POST',
    body: JSON.stringify({ opening_cash: openingCash }),
  });
}
