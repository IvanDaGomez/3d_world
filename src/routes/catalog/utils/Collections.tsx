import { Sparkles, Smartphone, Home, Gift, Building2 } from 'lucide-react'
import PRODUCTS from './Products'
import type { Collection } from './types'

const COLLECTIONS: Collection[] = [
  {
    id: 'featured',
    title: 'Destacados',
    subtitle: 'Nuestras creaciones más queridas',
    icon: Sparkles,
    products: PRODUCTS.filter(p => p.featured)
  },

  {
    id: 'nfc',
    title: 'Soluciones NFC',
    subtitle: 'Productos inteligentes para negocios modernos',
    icon: Smartphone,
    products: PRODUCTS.filter(
      p => p.category === 'NFC' || p.category === 'Business'
    )
  },

  {
    id: 'home',
    title: 'Hogar y Decoración',
    subtitle: 'Piezas minimalistas creadas con precisión',
    icon: Home,
    products: PRODUCTS.filter(
      p => p.category === 'Home' || p.category === 'Decoration'
    )
  },

  {
    id: 'gift',
    title: 'Ideas de Regalo',
    subtitle: 'Detalles únicos que realmente recordarán',
    icon: Gift,
    products: PRODUCTS.filter(p => p.category === 'Gift')
  },

  {
    id: 'custom',
    title: 'Fabricación a Medida',
    subtitle: 'Hecho exactamente como lo imaginas',
    icon: Building2,
    products: PRODUCTS.filter(p => p.category === 'Custom')
  }
]

export default COLLECTIONS
