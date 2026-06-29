import type { Product } from './types'

const PRODUCTS: Product[] = [
  {
    id: 0,
    title: 'Expositor de Reseñas de Google',
    subtitle: 'Colección Empresas',
    description:
      'Expositor moderno que permite a los clientes dejar reseñas al instante con tecnología inalámbrica NFC. Ideal para negocios que buscan mejorar su reputación en línea.',
    price: 49900,
    images: ['/products/Google Review Stand Final.png'],
    category: 'Empresas',
    featured: true,
    popular: true
  },
  {
    id: 1,
    title: 'Expositor de Redes de Empresa',
    subtitle: 'Colección Empresas',
    description:
      'Expositor moderno que permite a los clientes conectarse con tus redes sociales al instante con tecnología inalámbrica NFC. Ideal para negocios que buscan mejorar su presencia en línea.',
    price: 79900,
    images: ['/products/Business Stand Final.png'],
    category: 'Empresas',
    featured: true,
    popular: true
  },
  {
    id: 2,
    title: 'Lámpara de Recuerdos Personalizada',
    subtitle: 'Colección Hogar',
    description:
      'Transforma tus recuerdos favoritos en obras de arte iluminadas.',
    price: 69900,
    images: ['/products/Litophane Lamp.png'],
    category: 'Hogar',
    featured: true
  },

  {
    id: 3,
    title: 'Expositor de Menú para Restaurantes',
    subtitle: 'Colección Empresas',
    description: 'Ayuda a los clientes a descubrir tu menú con un solo toque.',
    price: 39900,
    images: ['/products/Menu.png'],
    category: 'Empresas',
    featured: true
  },

  {
    id: 4,
    title: 'Llavero Personalizado',
    subtitle: 'Colección Regalos',
    description:
      'Llaveros personalizados diseñados e impresos exclusivamente para ti.',
    price: 9900,
    images: ['/products/Keychain.png'],
    category: 'Regalos',
    minimum: 10
  },
  {
    id: 5,
    title: 'Imán de Nevera Personalizado',
    subtitle: 'Colección Regalos',
    description: 'Imanes de nevera personalizados para cualquier ocasión.',
    price: 9900,
    images: [
      '/products/Magnet 1.png',
      '/products/Magnet 2.png',
      '/products/Magnet 3.png',
      '/products/Magnet 4.png'
    ],
    category: 'Regalos',
    minimum: 10
  },
  {
    id: 6,
    title: 'Soporte de Velas',
    subtitle: 'Colección Decoración',
    description: 'Soporte de velas minimalista para un ambiente acogedor.',
    price: 29900,
    images: ['/products/Candle Holder.webp'],
    category: 'Decoración'
  },
  {
    id: 7,
    title: 'Soporte de Útiles de Oficina',
    subtitle: 'Colección Hogar',
    description:
      'Soporte de útiles de oficina diseñado para mantener tu espacio organizado.',
    price: 29900,
    images: ['/products/Pen holder.png'],
    category: 'Hogar'
  },
  {
    id: 8,
    title: 'Soporte de Utensilios de Cocina',
    subtitle: 'Colección Hogar',
    description:
      'Soporte de utensilios de cocina minimalista para mantener tu cocina ordenada.',
    price: 29900,
    images: ['/products/kitchen Utensil Holder.webp'],
    category: 'Hogar'
  },
  {
    id: 9,
    title: 'Mapas de Recuerdos Personalizados',
    subtitle: 'Colección Hogar',
    description:
      'Mapas personalizados con recuerdos especiales para recordar momentos únicos.',
    price: 59900,
    images: ['/products/Mapas personalizados final.png'],
    category: 'Hogar'
  },
  {
    id: 10,
    title: 'Soporte de Plantas Minimalista',
    subtitle: 'Colección Hogar',
    description: 'Soporte de plantas minimalista para un ambiente acogedor.',
    price: 29900,
    images: ['/products/Modern Flat Plant Holder.webp'],
    category: 'Hogar'
  },
  {
    id: 11,
    title: 'Arte de Pared Personalizado',
    subtitle: 'Colección Decoración',
    description:
      'Arte de pared personalizado para darle un toque único a tu espacio. El precio varía según el tamaño y la complejidad del diseño, asegurando que cada pieza sea única y especial.',
    price: 49900,
    images: ['/products/Wall art.png'],
    category: 'Decoración',
    featured: true
  }
  // {
  //   id: 11,
  //   title: 'Medallero Personalizado Modular',
  //   subtitle: 'Colección Regalos',
  //   description:
  //     'Medalleros personalizados diseñados e impresos exclusivamente para ti.',
  //   price: 7900,
  //   images: ['/products/Modular Medal.png'],
  //   category: 'Regalos'
  // }
]

export default PRODUCTS
