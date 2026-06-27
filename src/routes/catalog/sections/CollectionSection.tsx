import COLLECTIONS from '../utils/Collections'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import type { Product } from '../utils/types'
import { motion } from 'framer-motion'
import { cardVariant, stagger } from '../ui/variants'
import { ArrowRight, Star } from 'lucide-react'
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
    <section className='pb-32'>
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
          <Reveal key={collection.id} className='mb-28'>
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

                {/* <motion.button
                  whileHover={{
                    x: 4
                  }}
                  className='
                      hidden
                      md:flex
                      items-center
                      gap-2
                      font-semibold
                    '
                  style={{
                    color: '#78A8FF'
                  }}
                >
                  Explorar Colección
                  <ArrowRight size={17} />
                </motion.button> */}
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
                      '
                  >
                    {/* =======================================
                          PRODUCT CARD
                      ======================================= */}

                    <div
                      className='
                          rounded-[30px]
                          overflow-hidden
                          transition-all
                          duration-500
                          h-full
                        '
                      style={{
                        background: '#0A0F1E',
                        border: '1px solid #1A2440'
                      }}
                    >
                      {/* IMAGE */}

                      <div
                        className='
                            relative
                            h-[270px]
                            overflow-hidden
                          '
                      >
                        {/* Glow */}
                        <div
                          className='
                              absolute
                              inset-0
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                              duration-500
                            '
                          style={{
                            background:
                              'radial-gradient(circle at center, rgba(30,79,216,.22), transparent 70%)'
                          }}
                        />
                        <img
                          src={product.image}
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
                                background: 'rgba(30,79,216,.18)',
                                color: '#9CC2FF'
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
                                '
                              style={{
                                background: 'rgba(255,255,255,.08)',
                                color: '#fff'
                              }}
                            >
                              Featured
                            </span>
                          )}
                        </div>{' '}
                        {/* =======================================
                            CONTENT
                        ======================================= */}
                        <div className='p-7'>
                          {/* Category */}

                          <p
                            className='
                              uppercase
                              tracking-[0.18em]
                              text-[11px]
                              font-bold
                              mb-3
                            '
                            style={{
                              color: '#4D8CFF'
                            }}
                          >
                            {product.subtitle}
                          </p>

                          {/* Title */}

                          <h3
                            className='
                              text-2xl
                              font-black
                              leading-tight
                            '
                            style={{
                              color: '#E2E8F5',
                              fontFamily: 'var(--font-display)'
                            }}
                          >
                            {product.title}
                          </h3>

                          {/* Description */}

                          <p
                            className='mt-4 leading-7'
                            style={{
                              color: '#6D82A8'
                            }}
                          >
                            {product.description}
                          </p>

                          {/* Divider */}

                          <div
                            className='my-7 h-px'
                            style={{
                              background: '#1A2440'
                            }}
                          />

                          {/* Bottom */}

                          <div className='flex items-center justify-between'>
                            <div>
                              <p
                                className='text-xs uppercase tracking-wider'
                                style={{
                                  color: '#61779F'
                                }}
                              >
                                Starting at
                              </p>

                              <div
                                className='text-3xl font-black mt-1'
                                style={{
                                  color: '#E2E8F5'
                                }}
                              >
                                ${product.price.toLocaleString()}
                              </div>
                            </div>

                            <motion.button
                              whileHover={{
                                x: 5
                              }}
                              whileTap={{
                                scale: 0.97
                              }}
                              className='
                                group/button
                                w-14
                                h-14
                                rounded-2xl
                                flex
                                items-center
                                justify-center
                              '
                              style={{
                                background: '#101A34',
                                border: '1px solid #233862'
                              }}
                            >
                              <ArrowRight
                                size={18}
                                color='#E2E8F5'
                                className='
                                  transition-transform
                                  duration-300
                                  group-hover/button:translate-x-1
                                '
                              />
                            </motion.button>
                          </div>
                        </div>
                        {/* Hover Accent */}
                        <motion.div
                          className='
                            absolute
                            inset-x-0
                            top-0
                            h-[3px]
                            origin-left
                          '
                          initial={{
                            scaleX: 0
                          }}
                          whileHover={{
                            scaleX: 1
                          }}
                          transition={{
                            duration: 0.35
                          }}
                          style={{
                            background: 'linear-gradient(90deg,#1E4FD8,#67A7FF)'
                          }}
                        />
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
