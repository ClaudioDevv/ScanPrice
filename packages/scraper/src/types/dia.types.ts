export interface DiaCsvRow {
  product_id: string
  product_name: string
  subgroup: string
  brand: string
  price: string
}

export interface DiaProduct {
  sourceId: string
  name: string
  category: string
  brand: string
  price: number
}
