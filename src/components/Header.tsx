import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { PHONE_NUMBER, BRAND_NAME } from '@/utils/config'
const WA_MESSAGE =
  'Hola! Estoy interesado en uno de sus productos. ¿Podrían darme más información?'
const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
  WA_MESSAGE
)}`

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/catalog' },
  { label: 'Contacto', href: '#contact', isHash: true }
]

export default function Header () {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Manejar el cambio de background al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú móvil al cambiar de ruta o hacer click en un hash links
  const handleLinkClick = (isHash?: boolean) => {
    setIsOpen(false)
    if (isHash) {
      const id = isHash
        ? NAV_LINKS.find(link => link.label === 'Contacto')?.href
        : ''
      if (id) {
        setTimeout(() => {
          document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#04060C]/80 backdrop-blur-md border-[#1A2440]/60 py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className='max-w-6xl mx-auto px-6 flex items-center justify-between'>
          {/* ── LOGO BRAND ── */}
          <Link to='/' className='flex items-center gap-2.5 group'>
            <div
              className='w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 shadow-lg shadow-[#1E4FD8]/20 transition-transform duration-300 group-hover:scale-105'
              aria-hidden='true'
            >
              <img src='/logo.png' alt='' className='w-8' />
            </div>
            <span
              className='text-base font-bold text-white tracking-tight'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {BRAND_NAME}
            </span>
          </Link>

          {/* ── DESKTOP NAVIGATION ── */}
          <nav className='hidden md:flex items-center gap-8'>
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.href
              return link.isHash ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => {
                    e.preventDefault()
                    document
                      .querySelector(link.href)
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className='text-xs font-semibold uppercase tracking-widest text-[#6A80B0] hover:text-[#5C8AFF] transition-colors duration-150'
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-150 ${
                    isActive
                      ? 'text-[#1E4FD8]'
                      : 'text-[#6A80B0] hover:text-[#5C8AFF]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* ── DESKTOP CTA ── */}
          <div className='hidden md:flex items-center gap-4'>
            <a
              href={WA_HREF}
              target='_blank'
              rel='noopener noreferrer'
              className='
                group inline-flex items-center gap-2
                px-4 py-2 rounded-lg
                bg-[#1E4FD8] hover:bg-[#2A5FE8] text-white
                font-semibold text-xs uppercase tracking-wider
                transition-colors duration-200
                shadow-md shadow-[#1E4FD8]/10
              '
            >
              Cotizar Pieza
              <ArrowRight
                size={12}
                className='group-hover:translate-x-0.5 transition-transform'
              />
            </a>
          </div>

          {/* ── MOBILE MENU BUTTON ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden p-2 rounded-lg border border-[#1A2440] bg-[#0A0F1E]/60 text-[#6A80B0] hover:text-white transition-colors'
            aria-label='Toggle menu'
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* ── MOBILE DROPDOWN MODAL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-x-0 top-[57px] bottom-0 z-40 bg-[#04060C]/95 backdrop-blur-lg border-b border-[#1A2440] md:hidden px-6 py-8 flex flex-col justify-between'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className='flex flex-col gap-6'>
              {NAV_LINKS.map(link => {
                const isActive = location.pathname === link.href
                return link.isHash ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={e => {
                      e.preventDefault()
                      handleLinkClick(true)
                    }}
                    className='text-lg font-bold text-[#D0DCF4] hover:text-[#5C8AFF] tracking-wide'
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => handleLinkClick(false)}
                    className={`text-lg font-bold tracking-wide ${
                      isActive
                        ? 'text-[#1E4FD8]'
                        : 'text-[#D0DCF4] hover:text-[#5C8AFF]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className='flex flex-col gap-4'>
              <a
                href={WA_HREF}
                target='_blank'
                rel='noopener noreferrer'
                className='
                  w-full py-3.5 rounded-lg text-center
                  bg-[#1E4FD8] text-white font-semibold text-sm uppercase tracking-wider
                '
              >
                Cotizar ahora
              </a>
              <p className='text-center text-[10px] text-[#2D3F60]'>
                {BRAND_NAME} · Impresión 3D Profesional en Colombia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
