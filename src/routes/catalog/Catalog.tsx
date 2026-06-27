import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PHONE_NUMBER } from '@/utils/config'
import type { Product } from './utils/types'
import PRODUCTS from './utils/Products'
import ProductModal from './components/ProductModal'
import useGetPremiumGuarantees from './utils/useGetPremiumGuarantees'
import FeaturedProductSection from './sections/FeaturedProductSection'
import CollectionSection from './sections/CollectionSection'
import CTASection from './sections/CTASection'
import SearchEmptyState from './components/SearchEmptyState'
import HeroSection from './sections/HeroSection'

export default function Catalog () {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  /* ============================================================
     FEATURED AUTOPLAY
  ============================================================ */

  const featuredProducts = useMemo(() => PRODUCTS.filter(p => p.featured), [])

  useEffect(() => {
    if (featuredProducts.length <= 1) return

    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredProducts.length)
    }, 5500)

    return () => clearInterval(interval)
  }, [featuredProducts])

  /* ============================================================
     FILTERING
  ============================================================ */

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesSearch =
        search.trim() === '' ||
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [search, selectedCategory])

  const searching = search.trim().length > 0 || selectedCategory !== 'All'

  const featured =
    featuredProducts[featuredIndex % Math.max(featuredProducts.length, 1)]
  const randomFeatures = useGetPremiumGuarantees(featuredIndex)
  const handleProductClick = (product: Product) => {
    // Redirect to whatsapp with pre-filled message
    const message = `Hola, estoy interesado en el producto "${product.title}". ¿Podrías darme más información?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
  }
  return (
    <>
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <div
        className='min-h-screen overflow-x-hidden'
        style={{
          background: '#080B12'
        }}
      >
        {/* =======================================================
          HERO
      ======================================================= */}
        <HeroSection
          setFilterOpen={setFilterOpen}
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        {/* =======================================================}
          FILTER OPEN STATE
      ======================================================= */}
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
            onClick={() => setFilterOpen(false)}
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='absolute top-0 left-0 right-0 bg-[#0A0F1E] border-b border-[#1A2440] p-6'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex flex-col gap-4'>
                <input
                  type='text'
                  placeholder='Search products...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className='w-full h-12 rounded-lg px-4 text-white outline-none'
                  style={{
                    background: '#101932',
                    border: '1px solid #1A2440'
                  }}
                />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='w-full h-12 rounded-lg px-4 text-white outline-none'
                  style={{
                    background: '#101932',
                    border: '1px solid #1A2440'
                  }}
                >
                  <option value='All'>All Categories</option>
                  {Array.from(new Set(PRODUCTS.map(p => p.category))).map(
                    category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* =======================================================
          FEATURED PRODUCT
      ======================================================= */}
        <FeaturedProductSection
          searching={searching}
          featured={featured}
          randomFeatures={randomFeatures}
          setFeaturedIndex={setFeaturedIndex}
          featuredProducts={featuredProducts}
          handleProductClick={handleProductClick}
        />
        {/* =======================================================
          COLLECTIONS
      ======================================================= */}
        <CollectionSection
          search={search}
          selectedCategory={selectedCategory}
          setSelectedProduct={setSelectedProduct}
        />
        {/* =======================================================
          SEARCH EMPTY STATE
      ======================================================= */}
        <SearchEmptyState
          searching={searching}
          filteredProducts={filteredProducts}
          setSearch={setSearch}
          setSelectedCategory={setSelectedCategory}
        />
        {/* =======================================================
          FINAL CTA
      ======================================================= */}
        <CTASection />
      </div>
    </>
  )
}
