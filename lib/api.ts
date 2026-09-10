"use client";

// API client untuk backend FastAPI Nusantara Motor.
// Token JWT disimpan di localStorage (dipasang oleh session store) dan
// dikirim sebagai Authorization: Bearer <token>.
import type {
  AuthUser,
  GuidePayload,
  LoginResponse,
  Product,
  ProductGuide,
  ProductImportResult,
  ProductPayload,
  Sale,
  SaleItemInput,
  Transaction,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("nm_session");
    if (!raw) return null;
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body);
    } catch {
      // biarkan statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// Unduh file biner (xlsx/pdf) dari endpoint export. Token tetap dikirim,
// tapi Content-Type tidak dipaksa agar header respons asli terjaga.
async function downloadBlob(path: string): Promise<Blob> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body);
    } catch {
      // biarkan statusText
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.blob()) as Blob;
}

// Import katalog dari file Excel. Body harus multipart/form-data dengan field
// "file" — Content-Type sengaja tidak di-set agar browser mengisi boundary.
async function importProductsExcel(file: File): Promise<ProductImportResult> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/import/products/excel`, {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body);
    } catch {
      // biarkan statusText
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as ProductImportResult;
}

// Pemicu unduhan di sisi klien: buat object URL dari blob lalu klik <a>.
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<AuthUser>("/auth/me"),

  // Products
  listProducts: (params?: { search?: string; category?: string; brand?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.category) qs.set("category", params.category);
    if (params?.brand) qs.set("brand", params.brand);
    const q = qs.toString();
    return request<Product[]>(`/products/${q ? `?${q}` : ""}`);
  },
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (payload: ProductPayload) =>
    request<Product>("/products/", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: ProductPayload) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  getCategories: () => request<string[]>("/products/categories"),
  getBrands: () => request<string[]>("/products/brands"),
  getLowStock: () => request<Product[]>("/products/low-stock"),

  // Export/import katalog (file biner)
  exportProductsExcel: async () => {
    const blob = await downloadBlob("/export/products/excel");
    triggerDownload(blob, "katalog-produk.xlsx");
  },
  exportProductsPdf: async () => {
    const blob = await downloadBlob("/export/products/pdf");
    triggerDownload(blob, "katalog-harga.pdf");
  },
  importProductsExcel: (file: File) => importProductsExcel(file),

  // Guides (kegunaan kendaraan per produk)
  getGuidesByProduct: (productId: string) =>
    request<ProductGuide[]>(`/guides/product/${productId}`),
  createGuide: (payload: { product_id: string } & GuidePayload) =>
    request<ProductGuide>("/guides/", { method: "POST", body: JSON.stringify(payload) }),
  updateGuide: (guideId: string, payload: GuidePayload) =>
    request<ProductGuide>(`/guides/${guideId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteGuide: (guideId: string) =>
    request<void>(`/guides/${guideId}`, { method: "DELETE" }),

  // Sales
  listSales: () => request<Sale[]>("/sales/"),
  getSale: (id: string) => request<Sale>(`/sales/${id}`),
  createSale: (payload: {
    customer_name?: string | null;
    customer_contact?: string | null;
    notes?: string | null;
    items: SaleItemInput[];
  }) => request<Sale>("/sales/", { method: "POST", body: JSON.stringify(payload) }),
  deleteSale: (id: string) =>
    request<{ message: string }>(`/sales/${id}`, { method: "DELETE" }),

  // Ekspor riwayat penjualan (file biner xlsx).
  exportSalesExcel: async () => {
    const blob = await downloadBlob("/export/sales/excel");
    triggerDownload(blob, "riwayat-penjualan.xlsx");
  },

  // Transactions (hutang/piutang)
  listTransactions: (type?: string, status?: string) => {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (status) qs.set("status", status);
    const q = qs.toString();
    return request<Transaction[]>(`/transactions/${q ? `?${q}` : ""}`);
  },
  getTransactionSummary: () =>
    request<{ hutang: number; piutang: number }>("/transactions/summary"),
};
