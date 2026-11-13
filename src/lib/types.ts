export type Media = { type: "image" | "video"; url: string };

/** A colour of a product. stock null = no limit. */
export type Variant = { name: string; hex: string; stock: number | null; /** photo shown when this colour is picked */ image?: string };

/** A picture behind one banner slide. opacity 0-100; x and y 0-100 = which part of the picture stays in view. */
export type SlideBackground = { image: string; opacity: number; x: number; y: number };

/** Pictures behind the home banner: a default for every product slide (and the main slide if `all`),
 *  plus one per slide ("main" or a product id) that replaces the default for that slide. */
export type BannerSettings = SlideBackground & {
  all: boolean;
  slides: Record<string, SlideBackground>;
  /** Strength (0-100) of the default picture behind the whole page; 0 = off. */
  page: number;
  /** Products picked for the banner, in slide order, each with the photo to show.
   *  Empty = automatic (the first 6 products that have a photo). */
  products: BannerPick[];
};

/** One product chosen for the banner. image "" = the product's first photo. */
export type BannerPick = { id: string; image: string };

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
  /** Colours, each with its own stock. Empty = the product has no colour choice. */
  variants: Variant[];
  media: Media[];
};

export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  personalization: string;
  colour?: string;
};

/** An Instagram post that customers can shop from the website. */
export type Post = {
  id: string;
  number: number;
  title: string;
  caption: string;
  image: string;
  product_ids: string[];
  active: boolean;
  created_at: string;
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
