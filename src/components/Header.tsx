import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { BRAND_NAME } from '@/utils/config'

const WHATSAPP_NUMBER = '573123222128'
const WA_MESSAGE =
  'Hola! Estoy interesado en uno de sus productos. ¿Podrían darme más información?'
const WA_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

const NAV_LINKS: Array<{ label: string; href: string; isHash?: boolean }> = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/catalog' }
]

export default function Header () {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = (isHash?: boolean) => {
    setIsOpen(false)

    if (isHash) {
      const id = NAV_LINKS.find(link => link.label === 'Contacto')?.href
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
            ? 'bg-[#171512]/90 backdrop-blur-md border-[#D7A451]/20 py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className='max-w-6xl mx-auto px-6 flex items-center justify-between'>
          <Link to='/' className='flex items-center gap-2.5 group'>
            <div
              className='w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 shadow-lg shadow-[#D7A451]/15 transition-transform duration-300 group-hover:scale-105'
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
                  className='text-xs font-semibold uppercase tracking-widest text-[#B8B1A5] hover:text-[#F6D79D] transition-colors duration-150'
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-150 ${
                    isActive
                      ? 'text-[#D7A451]'
                      : 'text-[#B8B1A5] hover:text-[#F6D79D]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className='hidden md:flex items-center gap-3'>
            <a
              href={WA_HREF}
              target='_blank'
              rel='noopener noreferrer'
              className='group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#25D366]/25 bg-[#25D366]/[0.07] text-[#A8E8BB] font-semibold text-xs transition-all duration-200 hover:bg-[#25D366]/[0.11] hover:border-[#25D366]/40'
              aria-label='Contactar por WhatsApp al 312 322 2128'
            >
              <span className='w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.65)]' />
              312 322 2128
            </a>

            <a
              href={WA_HREF}
              target='_blank'
              rel='noopener noreferrer'
              className='group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D7A451] hover:bg-[#F0C77F] text-[#171512] font-semibold text-xs uppercase tracking-wider transition-colors duration-200 shadow-md shadow-[#D7A451]/10'
            >
              WhatsApp
              <ArrowRight
                size={12}
                className='group-hover:translate-x-0.5 transition-transform'
              />
            </a>
          </div>

          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden p-2 rounded-lg border border-[#3A342B] bg-[#171512]/70 text-[#B8B1A5] hover:text-white transition-colors'
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-x-0 top-[57px] bottom-0 z-40 bg-[#171512]/95 backdrop-blur-lg border-b border-[#3A342B] md:hidden px-6 py-8 flex flex-col justify-between'
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
                    className='text-lg font-bold text-[#E4DED4] hover:text-[#F6D79D] tracking-wide'
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
                        ? 'text-[#D7A451]'
                        : 'text-[#E4DED4] hover:text-[#F6D79D]'
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
                className='w-full rounded-xl border border-[#25D366]/25 bg-[#25D366]/[0.07] px-5 py-4 text-center text-sm font-semibold text-[#A8E8BB]'
              >
                WhatsApp · 312 322 2128
              </a>

              <a
                href={WA_HREF}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full py-3.5 rounded-lg text-center bg-[#D7A451] text-[#171512] font-semibold text-sm uppercase tracking-wider'
              >
                Cotizar ahora
              </a>

              <p className='text-center text-[10px] text-[#756D62]'>
                {BRAND_NAME} · Iluminación y fabricación premium en Colombia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
