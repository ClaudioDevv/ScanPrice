export interface Subcategory {
  subId: number;
  subName: string;
  superId: number;
  superName: string;
}

export interface ProductBasic {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  slug: string;
}

export interface ProductDetail extends ProductBasic {
  ean: string;
  brand: string;
}
