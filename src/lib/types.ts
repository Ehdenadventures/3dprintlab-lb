export type Media = { type: "image" | "video"; url: string };

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  parent_id: string | null;
  sort: number;
  active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category_id: string | null;
  active: boolean;
  personalizable: boolean;
  sort: number;
  /** How many are ready to sell. null = no limit (made to order). */
  stock: number | null;
  media: Media[];
};

export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  personalization: string;
};

export const ORDER_STATUSES = ["new", "confirmed", "printing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  number: number;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  payment_method: string;
  status: OrderStatus;
  delivery_status: string;
  delivery_ref: string | null;
  delivery_error: string | null;
  created_at: string;
};
