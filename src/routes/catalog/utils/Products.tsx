import type { Product } from './types'

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Expositor de Reseñas de Google',
    subtitle: 'Colección NFC',
    description:
      'Expositor NFC moderno que permite a los clientes dejar reseñas al instante.',
    price: 49900,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900',
    category: 'NFC',
    featured: true,
    popular: true
  },
  {
    id: 2,
    title: 'Lámpara Litofanía',
    subtitle: 'Colección Hogar',
    description:
      'Transforma tus recuerdos favoritos en obras de arte iluminadas.',
    price: 139900,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900',
    category: 'Home',
    featured: true
  },

  {
    id: 3,
    title: 'Expositor NFC de Instagram',
    subtitle: 'Colección Empresas',
    description:
      'Ayuda a los clientes a descubrir tus redes sociales con un solo toque.',
    price: 54900,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900',
    category: 'Business'
  },

  {
    id: 4,
    title: 'Llavero Personalizado',
    subtitle: 'Colección Regalos',
    description:
      'Llaveros personalizados diseñados e impresos exclusivamente para ti.',
    price: 15900,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900',
    category: 'Gift'
  },

  {
    id: 5,
    title: 'Menú NFC para Restaurantes',
    subtitle: 'Colección Empresas',
    description:
      'Elegantes expositores de menú con QR + NFC para restaurantes y cafeterías.',
    price: 79900,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900',
    category: 'Business'
  },

  {
    id: 6,
    title: 'Placa de Nombre Personalizada',
    subtitle: 'Decoración',
    description:
      'Decoración de escritorio minimalista de alta calidad y totalmente personalizable.',
    price: 39900,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900',
    category: 'Decoration'
  },

  {
    id: 7,
    title: 'Caja de Regalo Corporativa',
    subtitle: 'Colección Regalos',
    description:
      'Regalos premium personalizados para tus empleados y clientes.',
    price: 199900,
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900',
    category: 'Gift',
    popular: true
  },

  {
    id: 8,
    title: 'Trofeo Personalizado',
    subtitle: 'Colección a Medida',
    description:
      'Premios, trofeos y piezas conmemorativas fabricadas bajo pedido.',
    price: 89900,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900',
    category: 'Custom'
  }
]

export default PRODUCTS
