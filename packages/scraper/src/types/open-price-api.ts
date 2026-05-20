export interface OFFProduct {
  product_name: string | null;
  image_url: string | null;
  brands: string | null;
  categories_tags: string[];
}

export interface OFFPriceItem {
  product_code: string;          // EAN
  product_name: string | null;   // nombre en etiqueta del super
  price: number;
  currency: string;
  product: OFFProduct | null;
}

export interface OFFResponse {
  total: number
  pages: number
  page: number
  size: number
  items: OFFPriceItem[]
}

export interface ProductRow {
  ean: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  sourceId: string;
}
