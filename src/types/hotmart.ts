export type HotmartPurchaseStatus =
  | "APPROVED"
  | "COMPLETE"
  | "CANCELLED"
  | "REFUNDED"
  | "WAITING_PAYMENT"
  | "PRINTED_BILLET";

export type HotmartPaymentType = "PIX" | "CREDIT_CARD" | "BILLET";

export interface HotmartSale {
  id: string;
  transaction_code: string;
  purchase_status: HotmartPurchaseStatus;
  product_id: number;
  product_name: string;
  buyer_name: string | null;
  buyer_email: string | null;
  price: number;
  currency_code: string;
  installments: number | null;
  payment_type: HotmartPaymentType | null;
  source_account: string | null;
  person_id: string | null;
  order_date: string;
  approved_at: string | null;
}

export interface HotmartByProductItem {
  product_id: number;
  product_name: string;
  count: number;
  revenue: number;
}

export interface HotmartSummary {
  total_sales: number;
  total_revenue: number;
  by_status: Record<string, number>;
  by_product: HotmartByProductItem[];
}

export interface HotmartSalesFilters {
  status?: string;
  productId?: number;
  sourceAccount?: string;
  personId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface HotmartSummaryFilters {
  from?: string;
  to?: string;
  sourceAccount?: string;
}
