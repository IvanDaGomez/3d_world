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
    id: 'gift',
    title: 'Ideas de Regalo',
    subtitle: 'Sorprende a tus seres queridos con un regalo único',
    icon: Gift,
    products: PRODUCTS.filter(p => p.category === 'Regalos')
  },
  {
    id: 'nfc',
    title: 'Soluciones Tecnología Inalámbrica',
    subtitle: 'Productos inteligentes para negocios modernos',
    icon: Smartphone,
    products: PRODUCTS.filter(
      p => p.category === 'NFC' || p.category === 'Empresas'
    )
  },

  {
    id: 'home',
    title: 'Hogar y Decoración',
    subtitle: 'Piezas minimalistas creadas con precisión',
    icon: Home,
    products: PRODUCTS.filter(
      p => p.category === 'Hogar' || p.category === 'Decoración'
    )
  },
  {
    id: 'custom',
    title: 'Fabricación a Medida',
    subtitle: 'Hecho exactamente como lo imaginas',
    icon: Building2,
    products: PRODUCTS.filter(p => p.category === 'Personalizado')
  }
]

export default COLLECTIONS
