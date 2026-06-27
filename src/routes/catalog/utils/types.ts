interface Product {
  id: number
  title: string
  subtitle: string
  description: string

  price: number

  image: string

  category: 'NFC' | 'Business' | 'Home' | 'Gift' | 'Decoration' | 'Custom'

  featured?: boolean

  isNew?: boolean

  popular?: boolean
}

interface Collection {
  id: string

  title: string

  subtitle: string

  icon: React.ElementType

  products: Product[]
}

export type { Product, Collection }
