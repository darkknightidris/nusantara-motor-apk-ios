// Domain types — dipetakan dari source backend lama (FastAPI + Supabase).
// Sumber kebenaran: C:\Users\idris\nusantara-motor\backend\app\routers\*.py

export type Role = "owner" | "kasir";

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: Role;
}

export type PriceType = "modal" | "grosir" | "eceran";

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  unit: string;
  qty_per_box: number;
  price_modal_pcs: number;
  price_modal_box: number;
  price_grosir_pcs: number;
  price_grosir_box: number;
  price_eceran_pcs: number;
  price_eceran_box: number;
  stock: number;
  stock_min: number;
  kelebihan?: string | null;
  notes?: string | null;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price_type: PriceType;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  customer_name?: string | null;
  customer_contact?: string | null;
  notes?: string | null;
  total_amount: number;
  created_at: string;
  items?: SaleItem[];
}

// Item penjualan yang dikirim saat membuat transaksi (payload createSale).
export interface SaleItemInput {
  product_id: string;
  product_name: string;
  qty: number;
  price_type: PriceType;
  unit_price: number;
  subtotal: number;
}

export type TransactionType = "hutang" | "piutang";
export type TransactionStatus = "lunas" | "belum_lunas";

export interface Transaction {
  id: string;
  type: TransactionType;
  party_name: string;
  party_contact?: string | null;
  description?: string | null;
  total_amount: number;
  paid_amount: number;
  status: TransactionStatus;
  due_date?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  notes?: string | null;
  paid_at: string;
}

export interface TransactionDetail extends Transaction {
  payments: Payment[];
}

export interface ProductGuide {
  id: string;
  product_id: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year?: string | null;
  vehicle_cc?: string | null;
  notes?: string | null;
  products?: Pick<Product, "name" | "brand" | "category"> | null;
}

export interface TransactionAttachment {
  id: string;
  transaction_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

// Payload create/update produk (sesuai ProductCreate/ProductUpdate backend).
export interface ProductPayload {
  name: string;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  unit: string;
  qty_per_box: number;
  price_modal_pcs: number;
  price_modal_box: number;
  price_grosir_pcs: number;
  price_grosir_box: number;
  price_eceran_pcs: number;
  price_eceran_box: number;
  stock: number;
  stock_min: number;
  kelebihan?: string | null;
  notes?: string | null;
}

// Hasil POST /import/products/excel.
export interface ProductImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Payload guide (kegunaan kendaraan per produk). product_id hanya untuk create.
export interface GuidePayload {
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year?: string | null;
  vehicle_cc?: string | null;
  notes?: string | null;
}
