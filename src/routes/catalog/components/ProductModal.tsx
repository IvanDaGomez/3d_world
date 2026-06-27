import type { Product } from '../utils/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { X, Flame, ShoppingBag } from 'lucide-react'
import useGetPremiumGuarantees from '../utils/useGetPremiumGuarantees'
import { PHONE_NUMBER } from '@/utils/config'
interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export default function ProductModal ({ product, onClose }: ProductModalProps) {
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
    // Aquí puedes manejar la acción de clic en el producto, como redirigir a otra página o abrir un formulario de personalización.
    const message = `Hola, estoy interesado en el producto "${product.title}". ¿Podrías darme más información?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
  }
  if (!product) return null

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden'>
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
          className='relative w-full max-w-5xl rounded-[32px] border overflow-hidden shadow-2xl z-10 max-h-[90vh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
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
            className='absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center border transition-all z-20 group'
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
              SECCIÓN IZQUIERDA: IMAGEN PREMIUM
            ====================================================== */}
            <div
              className='relative min-h-[350px] lg:min-h-[500px] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r'
              style={{ borderColor: '#1A2440' }}
            >
              {/* Resplandor radial detrás de la imagen del producto */}
              <div
                className='absolute inset-0 opacity-40 pointer-events-none'
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(30,79,216,.25), transparent 70%)'
                }}
              />

              {/* Etiquetas flotantes en la imagen */}
              <div className='absolute top-6 left-6 flex gap-2 flex-wrap'>
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

              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                src={product.image}
                alt={product.title}
                className='w-full h-full max-h-[420px] object-cover rounded-2xl relative z-10'
              />
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
                      ${product.price.toLocaleString()}
                    </span>
                    <span
                      className='pb-1 text-sm font-semibold'
                      style={{ color: '#647BA5' }}
                    >
                      COP
                    </span>
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
