import {
  BadgeCheck,
  Layers,
  Package,
  Star,
  Grid,
  ChevronDown
} from 'lucide-react'
import { useMemo } from 'react'

export default function useGetPremiumGuarantees (featuredIndex: number | null) {
  return useMemo(() => {
    if (featuredIndex === null) return []
    const products = [
      {
        icon: BadgeCheck,
        title: 'Acabado Premium'
      },
      {
        icon: Package,
        title: 'Hecho a Medida'
      },
      {
        icon: Layers,
        title: 'Personalizable'
      },
      {
        icon: Star,
        title: 'Más Calificado'
      },
      {
        icon: Grid,
        title: 'Diseño Minimalista'
      },
      {
        icon: ChevronDown,
        title: 'Fácil de Usar'
      }
    ]
    // eslint-disable-next-line react-hooks/purity
    return products.sort(() => Math.random() - 0.5).slice(0, 4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredIndex])
}
