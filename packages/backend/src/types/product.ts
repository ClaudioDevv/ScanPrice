export interface Product {
  id: number,
  name: string,
  category: string | null,
  supermarket: string,
  brand: string | null,
  price: number,
  normalized_name_id: number | null,
  image_url: string | null
}
