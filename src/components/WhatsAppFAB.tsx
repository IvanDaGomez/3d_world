import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PHONE_NUMBER, BRAND_NAME } from '@/utils/config'
// ─────────────────────────────────────────────────────────────
// Config — swap these before going live
// ─────────────────────────────────────────────────────────────
const WA_MESSAGE =
  'Hola! Me interesa conocer más sobre sus servicios de impresión 3D.'
const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
  WA_MESSAGE
)}`

// ─────────────────────────────────────────────────────────────
// WhatsApp icon SVG
// ─────────────────────────────────────────────────────────────
function WAIcon ({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      className={className}
      aria-hidden='true'
    >
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Close icon
// ─────────────────────────────────────────────────────────────
function CloseIcon ({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      strokeLinecap='round'
      className={className}
      aria-hidden='true'
    >
      <path d='M18 6 6 18M6 6l12 12' />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// WhatsAppFAB
// ─────────────────────────────────────────────────────────────
export default function WhatsAppFAB () {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  // Delay initial appearance so it doesn't compete with page load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1400)
    return () => clearTimeout(t)
  }, [])

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!visible) return null

  return (
    <>
      {/* ── Backdrop (mobile) ───────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className='fixed inset-0 z-40 sm:hidden'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            aria-hidden='true'
          />
        )}
      </AnimatePresence>

      {/* ── Wrapper ─────────────────────────────────────── */}
      <div className='fixed bottom-6 right-5 sm:right-6 z-50 flex flex-col items-end gap-3'>
        {/* ── Tooltip / mini panel ────────────────────────── */}
        <AnimatePresence>
          {open && (
            <motion.div
              role='dialog'
              aria-label='Contactar por WhatsApp'
              className='
                w-72 rounded-2xl overflow-hidden
                border border-[#1A2440]
                shadow-2xl shadow-black/50
              '
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1.0 }}
              exit={{ opacity: 0, y: 10, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              style={{ transformOrigin: 'bottom right' }}
            >
              {/* Panel header */}
              <div
                className='px-4 py-3.5 flex items-center gap-3'
                style={{ background: '#0D1628' }}
              >
                {/* Online avatar */}
                <div className='relative shrink-0'>
                  <div
                    className='
                    w-10 h-10 rounded-full
                    bg-white border border-[#243050]
                    flex items-center justify-center
                  '
                  >
                    {/* Shield mark */}
                    <img src='/logo.png' alt='' className='w-6' />
                  </div>
                  {/* Online dot */}
                  <span
                    className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-[#0D1628]'
                    aria-label='En línea'
                  />
                </div>

                <div className='flex flex-col min-w-0'>
                  <span
                    className='text-sm font-semibold text-white truncate'
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {BRAND_NAME}
                  </span>
                  <span className='text-[11px]' style={{ color: '#25D366' }}>
                    En línea
                  </span>
                </div>
              </div>

              {/* Chat bubble area */}
              <div className='px-4 pt-4 pb-3' style={{ background: '#080B12' }}>
                {/* Simulated incoming message */}
                <motion.div
                  className='
                    max-w-[88%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm
                    bg-[#0D1628] border border-[#1A2440]
                    mb-4
                  '
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                >
                  <p
                    className='text-sm leading-snug'
                    style={{ color: '#C8D4F0' }}
                  >
                    ¡Hola! ¿En qué te podemos ayudar hoy?
                  </p>
                </motion.div>

                {/* Quick-reply chips */}
                <motion.div
                  className='flex flex-wrap gap-2 mb-4'
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.3 }}
                >
                  {[
                    'Quiero cotizar',
                    'Dudas de materiales',
                    'Ver catálogo'
                  ].map(chip => {
                    const msg = encodeURIComponent(`Hola! ${chip}.`)
                    return (
                      <a
                        key={chip}
                        href={`https://wa.me/${PHONE_NUMBER}?text=${msg}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='
                          px-3 py-1.5 rounded-full
                          border border-[#1A2440] hover:border-[#1E4FD8]/60
                          text-[11px] font-medium
                          transition-all duration-150
                          hover:bg-[#0D1628]
                          whitespace-nowrap
                        '
                        style={{ color: '#6A90C0' }}
                      >
                        {chip}
                      </a>
                    )
                  })}
                </motion.div>

                {/* Main CTA */}
                <motion.a
                  href={WA_HREF}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='
                    flex items-center justify-center gap-2.5
                    w-full py-3 rounded-xl
                    bg-[#25D366] hover:bg-[#1fbd5a]
                    text-white font-semibold text-sm
                    transition-colors duration-200
                    shadow-lg shadow-[#25D366]/20
                  '
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setOpen(false)}
                >
                  <WAIcon className='w-4 h-4' />
                  Abrir WhatsApp
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FAB button ──────────────────────────────────── */}
        <motion.button
          type='button'
          onClick={() => setOpen(v => !v)}
          aria-label={
            open ? 'Cerrar contacto WhatsApp' : 'Abrir contacto WhatsApp'
          }
          aria-expanded={open}
          className='relative flex items-center justify-center focus-visible:outline-none'
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
        >
          {/* Outer pulse ring — only when closed */}
          <AnimatePresence>
            {!open && (
              <motion.span
                aria-hidden='true'
                className='absolute inset-0 rounded-full bg-[#25D366]'
                initial={{ opacity: 0.45, scale: 1 }}
                animate={{ opacity: 0, scale: 1.65 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            )}
          </AnimatePresence>

          {/* Second ring, offset timing */}
          <AnimatePresence>
            {!open && (
              <motion.span
                aria-hidden='true'
                className='absolute inset-0 rounded-full bg-[#25D366]'
                initial={{ opacity: 0.3, scale: 1 }}
                animate={{ opacity: 0, scale: 1.45 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.5
                }}
              />
            )}
          </AnimatePresence>

          {/* Button face */}
          <motion.div
            className='
              relative w-14 h-14 rounded-full
              flex items-center justify-center
              shadow-xl shadow-black/40
            '
            animate={{
              background: open ? '#0F1520' : '#25D366',
              borderColor: open ? '#1E4FD8' : 'transparent'
            }}
            transition={{ duration: 0.2 }}
            style={{ border: '2px solid transparent' }}
          >
            {/* Icon crossfade */}
            <AnimatePresence mode='wait'>
              {open ? (
                <motion.div
                  key='close'
                  initial={{ rotate: -45, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 45, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  className='text-[#5C8AFF]'
                >
                  <CloseIcon className='w-6 h-6' />
                </motion.div>
              ) : (
                <motion.div
                  key='wa'
                  initial={{ rotate: 45, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -45, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  className='text-white'
                >
                  <WAIcon className='w-7 h-7' />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}
