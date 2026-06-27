interface Product {
  id: number
  title: string
  subtitle: string
  description: string

  price: number

  image: string

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
