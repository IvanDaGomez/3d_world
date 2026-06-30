import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Reveal from '../components/Reveal'
import type { Product } from '../utils/types'
import { motion } from 'framer-motion'
import { formatPrice } from '../utils/formatPrice'
export default function FeaturedProductSection ({
  searching,
  featured,
  randomFeatures,
  setFeaturedIndex,
  featuredProducts,
  handleProductClick
}: {
  searching: boolean
  featured: Product | null
  randomFeatures: { icon: React.ElementType; title: string }[]
  setFeaturedIndex: React.Dispatch<React.SetStateAction<number>>
  featuredProducts: Product[]
  handleProductClick: (product: Product) => void
}) {
  if (searching || !featured) return null
  return (
    <section className='py-20 px-6'>
      <Reveal>
        <div
          className='
                relative
                overflow-hidden
                rounded-[32px]
                border
                max-w-7xl
                mx-auto
              '
          style={{
            background: '#0A0F1E',
            borderColor: '#1A2440'
          }}
        >
          {' '}
          {/* Decorative glow */}
          <div
            aria-hidden
            className='absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20'
            style={{
              background: '#1E4FD8'
            }}
          />
          <div className='grid lg:grid-cols-2 min-h-[540px]'>
            {/* ======================================================
                    LEFT CONTENT
                ====================================================== */}
            <div className='relative p-10 lg:p-16 flex flex-col justify-center'>
              <motion.div
                key={featured.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <h2
                  className='text-5xl lg:text-6xl font-black leading-none tracking-tight'
                  style={{
                    color: '#E2E8F5',
                    fontFamily: 'var(--font-display)'
                  }}
                >
                  {featured.title}
                </h2>

                <p
                  className='mt-4 text-lg'
                  style={{
                    color: '#7E97C5'
                  }}
                >
                  {featured.subtitle}
                </p>

                <p
                  className='mt-8 leading-8 max-w-xl'
                  style={{
                    color: '#5E739D'
                  }}
                >
                  {featured.description}
                </p>

                {/* FEATURES */}

                <div className='grid grid-cols-2 gap-4 mt-10'>
                  {randomFeatures.map(item => {
                    const Icon = item.icon

                    return (
                      <div key={item.title} className='flex items-center gap-3'>
                        <div
                          className='
                                w-11
                                h-11
                                rounded-xl
                                flex
                                items-center
                                justify-center
                              '
                          style={{
                            background: '#111A33',
                            border: '1px solid #22325A'
                          }}
                        >
                          <Icon size={18} color='#1E4FD8' />
                        </div>

                        <span
                          className='font-medium'
                          style={{
                            color: '#D7E3F8'
                          }}
                        >
                          {item.title}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* PRICE */}

                <div className='mt-12 flex items-end gap-3'>
                  <span
                    className='text-5xl font-black'
                    style={{
                      color: '#E2E8F5'
                    }}
                  >
                    ${formatPrice(featured)}
                  </span>

                  <span
                    className='pb-2'
                    style={{
                      color: '#647BA5'
                    }}
                  >
                    COP
                  </span>
                </div>

                {/* BUTTONS */}

                <div className='flex flex-wrap gap-4 mt-10'>
                  <motion.button
                    onClick={() => {
                      handleProductClick(featured)
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className='
                          px-8
                          h-14
                          rounded-xl
                          font-semibold
                          flex
                          items-center
                          gap-3
                        '
                    style={{
                      background: '#1E4FD8',
                      color: 'white'
                    }}
                  >
                    Ver Producto
                    <ArrowRight size={17} />
                  </motion.button>
                </div>
              </motion.div>
            </div>
            {/* ======================================================
                    RIGHT IMAGE
                ====================================================== */}

            <div
              className='
    relative
    flex
    items-center
    justify-center
    overflow-hidden
    min-h-[500px]
    lg:h-full /* Permite que tome el alto completo de la fila en pantallas grandes */
  '
            >
              <motion.div
                key={featured.images[0]}
                initial={{
                  opacity: 0,
                  scale: 0.92
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  duration: 0.7
                }}
                className='relative w-full h-full flex items-center justify-center p-6 lg:p-10'
              >
                {/* Contenedor de la imagen con proporciones y bordes fijos */}
                <div
                  className='
                    relative
                    w-full
                    aspect-square
                    min-h-[400px]
                    rounded-[28px]
                    overflow-hidden
                  '
                >
                  <img
                    src={featured.images[0]}
                    alt={featured.title}
                    className='
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                      object-center
                    '
                  />
                </div>
              </motion.div>
            </div>
          </div>
          {/* Bottom controls */}
          <div
            className='
                  absolute
                  bottom-8
                  right-8
                  flex
                  items-center
                  gap-3
                '
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setFeaturedIndex(prev =>
                  prev === 0 ? featuredProducts.length - 1 : prev - 1
                )
              }
              className='
                    w-12
                    h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                  '
              style={{
                background: '#10172E',
                border: '1px solid #23355F'
              }}
            >
              <ChevronLeft size={18} color='#E2E8F5' />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setFeaturedIndex(prev => (prev + 1) % featuredProducts.length)
              }
              className='
                    w-12
                    h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                  '
              style={{
                background: '#1E4FD8'
              }}
            >
              <ChevronRight size={18} color='white' />
            </motion.button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
