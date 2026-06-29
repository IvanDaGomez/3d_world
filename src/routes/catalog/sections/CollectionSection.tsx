import COLLECTIONS from '../utils/Collections'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import type { Product } from '../utils/types'
import { motion } from 'framer-motion'
import { cardVariant, stagger } from '../ui/variants'
import { Star } from 'lucide-react'

export default function CollectionSection ({
  search,
  selectedCategory,
  setSelectedProduct
}: {
  search: string
  selectedCategory: string
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>
}) {
  return (
    <section className='pb-4'>
      {COLLECTIONS.map(collection => {
        /* Apply search/category filtering */
        const products = collection.products.filter(product => {
          const matchesSearch =
            search.trim() === '' ||
            product.title.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase())

          const matchesCategory =
            selectedCategory === 'All' || product.category === selectedCategory

          return matchesSearch && matchesCategory
        })

        if (products.length === 0) return null

        return (
          <Reveal key={collection.id} className='mb-4'>
            {/* ===========================================
                  SECTION HEADER
              =========================================== */}
            <div className='max-w-7xl mx-auto px-6 mb-10'>
              <div className='flex items-end justify-between gap-6'>
                <div>
                  <SectionHeading>{collection.title}</SectionHeading>
                  <p
                    className='mt-3 max-w-2xl text-lg'
                    style={{
                      color: '#6F87B4'
                    }}
                  >
                    {collection.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* ===========================================
                  PRODUCT ROW
              =========================================== */}
            <div
              className='
                  overflow-x-auto
                  pb-3
                  [scrollbar-width:none]
                  max-w-7xl
                  mx-auto
                  [&::-webkit-scrollbar]:hidden
                '
            >
              <motion.div
                variants={stagger}
                initial='hidden'
                whileInView='visible'
                viewport={{
                  once: true,
                  margin: '-80px'
                }}
                className='
                    flex
                    gap-7
                    px-6
                    w-max
                  '
              >
                {products.map(product => (
                  <motion.div
                    onClick={() => setSelectedProduct(product)}
                    key={product.id}
                    variants={cardVariant}
                    whileHover={{
                      y: -10
                    }}
                    className='
                        group
                        shrink-0
                        w-[330px]
                        cursor-pointer
                      '
                  >
                    {/* =======================================
                          PRODUCT CARD (Image Only)
                      ======================================= */}
                    <div
                      className='
                          relative
                          w-full
                          aspect-square
                          rounded-[30px]
                          overflow-hidden
                          transition-all
                          duration-500
                        '
                      style={{
                        background: '#0A0F1E',
                        border: '1px solid #1A2440'
                      }}
                    >
                      {/* Glow Overlay */}
                      <div
                        className='
                            absolute
                            inset-0
                            z-10
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                            duration-500
                            pointer-events-none
                          '
                        style={{
                          background:
                            'radial-gradient(circle at center, rgba(30,79,216,.15), transparent 70%)'
                        }}
                      />

                      {/* Product Image */}
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className='
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-110
                          '
                      />

                      {/* TOP BADGES */}
                      <div
                        className='
                            absolute
                            top-5
                            left-5
                            z-20
                            flex
                            gap-2
                            flex-wrap
                          '
                      >
                        {product.popular && (
                          <span
                            className='
                                px-3
                                h-8
                                rounded-full
                                text-xs
                                font-semibold
                                flex
                                items-center
                                gap-2
                              '
                            style={{
                              background: 'rgba(30,79,216,.58)',
                              color: 'white'
                            }}
                          >
                            <Star size={13} />
                            Popular
                          </span>
                        )}

                        {product.featured && (
                          <span
                            className='
                                px-3
                                h-8
                                rounded-full
                                text-xs
                                font-semibold
                                flex
                                items-center
                                gap-2
                              '
                            style={{
                              background: 'rgba(0,0,0,.8)',
                              color: '#fff'
                            }}
                          >
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Reveal>
        )
      })}
    </section>
  )
}
