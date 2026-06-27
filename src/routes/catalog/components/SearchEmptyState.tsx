import { Search } from 'lucide-react'
import type { Product } from '../utils/types'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { motion } from 'framer-motion'
export default function SearchEmptyState ({
  searching,
  filteredProducts,
  setSearch,
  setSelectedCategory
}: {
  searching: boolean
  filteredProducts: Product[]
  setSearch: (s: string) => void
  setSelectedCategory: (s: string) => void
}) {
  if (!searching || filteredProducts.length !== 0) return null

  return (
    <section className='py-32'>
      <Reveal>
        <div className='max-w-3xl mx-auto px-6'>
          <div
            className='
                  rounded-[36px]
                  border
                  text-center
                  p-16
                '
            style={{
              background: '#0A0F1E',
              borderColor: '#1A2440'
            }}
          >
            <div
              className='
                    w-24
                    h-24
                    rounded-full
                    mx-auto
                    mb-8
                    flex
                    items-center
                    justify-center
                  '
              style={{
                background: '#101932'
              }}
            >
              <Search size={34} color='#1E4FD8' />
            </div>

            <SectionHeading>No se encontraron productos</SectionHeading>

            <p
              className='mt-6 text-lg leading-8'
              style={{
                color: '#6C82AA'
              }}
            >
              No se encontraron productos que coincidan con tu búsqueda. Intenta
              ajustar tus filtros o palabras clave para encontrar lo que estás
              buscando.
            </p>

            <motion.button
              whileHover={{
                scale: 1.03
              }}
              whileTap={{
                scale: 0.97
              }}
              onClick={() => {
                setSearch('')
                setSelectedCategory('All')
              }}
              className='
                    mt-10
                    px-8
                    h-14
                    rounded-xl
                    font-semibold
                  '
              style={{
                background: '#1E4FD8',
                color: 'white'
              }}
            >
              Quitar Filtros
            </motion.button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
