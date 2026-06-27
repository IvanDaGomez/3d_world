import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { stagger, cardVariant } from '../ui/variants'

function Accent ({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#1E4FD8' }}>{children}</span>
}

export default function HeroSection ({
  setFilterOpen,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory
}: {
  setFilterOpen: (open: boolean) => void
  search: string
  setSearch: (s: string) => void
  selectedCategory: string
  setSelectedCategory: (s: string) => void
}) {
  return (
    <section
      className='relative py-10 overflow-hidden flex items-center'
      style={{
        background: '#04060C'
      }}
    >
      {/* Three.js */}

      {/* Grid */}

      <div
        aria-hidden
        className='absolute inset-0 opacity-[0.035]'
        style={{
          backgroundImage: [
            'linear-gradient(rgba(30,79,216,.8) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(30,79,216,.8) 1px, transparent 1px)'
          ].join(','),
          backgroundSize: '72px 72px'
        }}
      />

      {/* Glow */}

      <div
        className='absolute inset-0'
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(30,79,216,.15), transparent 60%)'
        }}
      />

      <div className='relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10'>
        <motion.div
          variants={stagger}
          initial='hidden'
          animate='visible'
          className='w-full'
        >
          <motion.h1
            variants={cardVariant}
            className='text-5xl md:text-7xl font-black leading-none tracking-tight'
            style={{
              color: '#E2E8F5',
              fontFamily: 'var(--font-display)'
            }}
          >
            Productos personalizados
            <hr className='h-4 text-transparent' />
            <Accent>Diseñados para impresionar.</Accent>
          </motion.h1>

          {/* SEARCH */}

          <motion.div
            variants={cardVariant}
            className='mt-10 flex flex-col sm:flex-row gap-3'
          >
            <div className='relative flex-1 w-full'>
              <Search
                size={17}
                className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400'
              />

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Buscar productos...'
                className='
                    w-full
                    h-14
                    rounded-2xl
                    pl-12
                    pr-5
                    text-white
                    outline-none
                    transition-all
                  '
                style={{
                  background: '#0A0F1E',
                  border: '1px solid #1A2440'
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(true)}
              className='
                  h-14
                  px-6
                  rounded-2xl
                  flex
                  items-center
                  gap-3
                  font-semibold
                '
              style={{
                background: '#0A0F1E',
                border: '1px solid #1A2440',
                color: '#E2E8F5'
              }}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </motion.button>
          </motion.div>

          {/* CATEGORY PILLS */}

          {/* <motion.div
            variants={cardVariant}
            className='flex gap-3 mt-8 overflow-x-auto pb-2'
          >
            {[
              'Todos',
              'NFC',
              'Negocios',
              'Casa',
              'Regalos',
              'Decoración',
              'Personalizado'
            ].map(category => {
              const active = category === selectedCategory

              return (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className='
                      shrink-0
                      px-5
                      h-10
                      rounded-full
                      text-sm
                      font-semibold
                      transition-all
                    '
                  style={{
                    background: active ? '#1E4FD8' : '#0A0F1E',

                    border: active ? '1px solid #1E4FD8' : '1px solid #1A2440',

                    color: active ? '#fff' : '#9BB0D8'
                  }}
                >
                  {category}
                </motion.button>
              )
            })}
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  )
}
