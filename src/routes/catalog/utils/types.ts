interface Product {
  id: number
  title: string
  subtitle: string
  description: string
  minPrice?: number
  maxPrice?: number
  price?: number

  images: string[]

  category:
    | 'NFC'
    | 'Empresas'
    | 'Hogar'
    | 'Regalos'
    | 'Decoración'
    | 'Personalizado'

  featured?: boolean

  isNew?: boolean

  popular?: boolean
  minimum?: number
}

interface Collection {
  id: string

  title: string

  subtitle: string

  icon: React.ElementType

  products: Product[]
}

export type { Product, Collection }
