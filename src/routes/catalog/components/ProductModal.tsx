import type { Product } from '../utils/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X, Flame, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import useGetPremiumGuarantees from '../utils/useGetPremiumGuarantees'
import { PHONE_NUMBER } from '@/utils/config'
import { formatPrice } from '../utils/formatPrice'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export default function ProductModal ({ product, onClose }: ProductModalProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  // Resetear el índice de la imagen cuando cambia o se abre un nuevo producto
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentImgIndex(0)
  }, [product])

  // Cerrar modal al presionar la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (product) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product, onClose])

  const premiumGuarantees = useGetPremiumGuarantees(product?.id || null)

  const handleProductClick = (product: Product) => {
    const message = `Hola, estoy interesado en el producto "${product.title}". ¿Podrías darme más información?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  useEffect(() => {
    if (!product) return
    document.body.style.overflow = 'hidden' // Evitar scroll de fondo cuando el modal está abierto
    return () => {
      document.body.style.overflow = 'auto' // Restaurar scroll al cerrar el modal
    }
  }, [product])

  if (!product) return null
  const images = product.images

  const nextImage = () => {
    setCurrentImgIndex(prev => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImgIndex(prev => (prev - 1 + images.length) % images.length)
  }

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto'>
        {/* =======================================================
          BACKDROP (Fondo difuminado de alta gama)
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='absolute inset-0 backdrop-blur-xl bg-black/60'
        />

        {/* =======================================================
          MODAL CONTENT CARD
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className='relative w-full max-w-5xl rounded-[32px] border overflow-scroll shadow-2xl z-10 max-h-[90vh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          style={{
            background: '#0A0F1E',
            borderColor: '#1A2440'
          }}
        >
          {/* Brillo decorativo interno */}
          <div
            aria-hidden
            className='absolute -left-32 -bottom-32 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none'
            style={{ background: '#1E4FD8' }}
          />

          {/* BOTÓN CERRAR */}
          <button
            onClick={onClose}
            className='absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center border transition-all z-30 group'
            style={{
              background: '#10172E',
              borderColor: '#23355F'
            }}
          >
            <X
              size={20}
              className='text-slate-400 group-hover:text-white transition-colors'
            />
          </button>

          <div className='grid lg:grid-cols-2'>
            {/* ======================================================
              SECCIÓN IZQUIERDA: GALERÍA DE IMÁGENES
            ====================================================== */}
            <div
              className='relative min-h-[400px] lg:min-h-[550px] flex flex-col items-center justify-center p-6 md:p-8 border-b lg:border-b-0 lg:border-r gap-4'
              style={{ borderColor: '#1A2440' }}
            >
              {/* Resplandor radial */}
              <div
                className='absolute inset-0 opacity-40 pointer-events-none'
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(30,79,216,.25), transparent 70%)'
                }}
              />

              {/* Etiquetas flotantes en la imagen */}
              <div className='absolute top-6 left-6 flex gap-2 flex-wrap z-20'>
                {product.popular && (
                  <span
                    className='px-3 h-8 rounded-full text-xs font-semibold flex items-center gap-2'
                    style={{
                      background: 'rgba(30,79,216,.18)',
                      color: '#9CC2FF'
                    }}
                  >
                    <Flame size={13} />
                    Popular
                  </span>
                )}
                {product.isNew && (
                  <span
                    className='px-3 h-8 rounded-full text-xs font-semibold flex items-center'
                    style={{
                      background: 'rgba(255,255,255,.08)',
                      color: '#fff'
                    }}
                  >
                    Nuevo
                  </span>
                )}
              </div>

              {/* CONTENEDOR PRINCIPAL DE IMAGEN */}
              <div className='relative w-full max-w-[420px] max-h-[420px] aspect-square rounded-2xl overflow-hidden z-10 group/slider'>
                {/* Botones de navegación (Solo si hay más de 1 imagen) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/70'
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextImage}
                      className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/70'
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Capa de cobertura para marcas de agua */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{
                    background:
                      'linear-gradient(270deg, #0A0F1E 0%, transparent 70%, transparent 100%)'
                  }}
                  className='absolute bottom-0 right-0 h-14 pointer-events-none z-20 pl-16 pr-4 py-2 text-xs font-medium text-slate-400/80 tracking-wide flex items-center justify-end w-64'
                >
                  Calidad Premium
                </motion.div>

                {/* Render dinámico de imagen con llave única para reiniciar animación al cambiar */}
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={currentImgIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    src={images[currentImgIndex]}
                    alt={`${product.title} - Vista ${currentImgIndex + 1}`}
                    className='w-full h-full object-cover'
                  />
                </AnimatePresence>
              </div>

              {/* CAROUSEL MINIATURAS (THUMBNAILS) */}
              {images.length > 1 && (
                <div className='flex gap-2.5 overflow-x-auto max-w-[420px] py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-10'>
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImgIndex(index)}
                      className='w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 relative'
                      style={{
                        borderColor:
                          currentImgIndex === index ? '#1E4FD8' : '#1A2440',
                        opacity: currentImgIndex === index ? 1 : 0.5
                      }}
                    >
                      <img
                        src={img}
                        alt='Thumbnail'
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ======================================================
              SECCIÓN DERECHA: INFORMACIÓN DETALLADA
            ====================================================== */}
            <div className='p-8 md:p-12 flex flex-col justify-between relative z-10'>
              <div>
                {/* Título Principal */}
                <h2
                  className='text-4xl md:text-5xl font-black leading-tight tracking-tight'
                  style={{
                    color: '#E2E8F5',
                    fontFamily: 'var(--font-display)'
                  }}
                >
                  {product.title}
                </h2>

                {/* Descripción Fluida */}
                <p
                  className='mt-5 leading-8 text-base md:text-lg'
                  style={{ color: '#7E97C5' }}
                >
                  {product.description}
                </p>

                {/* Separador */}
                <div className='my-8 h-px' style={{ background: '#1A2440' }} />

                {/* Beneficios Incorporados */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  {premiumGuarantees.map(item => (
                    <div key={item.title} className='flex gap-3'>
                      <item.icon
                        size={20}
                        className='text-[#4D8CFF] flex-shrink-0'
                      />
                      <div>
                        <p
                          className='font-semibold'
                          style={{ color: '#E2E8F5' }}
                        >
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque de compra e inversión inferior */}
              <div
                className='mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-6'
                style={{ borderColor: '#1A2440' }}
              >
                <div>
                  <p
                    className='text-xs uppercase tracking-wider mb-1'
                    style={{ color: '#61779F' }}
                  >
                    Precio único desde
                  </p>
                  <div className='flex items-end gap-2'>
                    <span
                      className='text-4xl font-black'
                      style={{ color: '#E2E8F5' }}
                    >
                      ${formatPrice(product)}
                    </span>
                    <span
                      className='pb-1 text-sm font-semibold'
                      style={{ color: '#647BA5' }}
                    >
                      COP
                    </span>
                    {product.minimum && (
                      <span
                        className='pb-1 text-sm font-semibold'
                        style={{ color: '#647BA5' }}
                      >
                        (Mínimo {product.minimum} unidades)
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón de acción principal */}
                <motion.button
                  onClick={() => handleProductClick(product)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className='px-8 h-14 rounded-xl font-semibold flex items-center gap-3 bg-[#1E4FD8] text-white shadow-lg shadow-blue-900/20'
                >
                  <ShoppingBag size={18} />
                  Solicitar Personalización
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
