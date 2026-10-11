import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition
} from 'framer-motion'
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

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/*  ink       #1D1D1F  primary text / primary button                          */
/*  muted     #6E6E73  secondary text                                         */
/*  accent-tx #96600F  brand text (AA on white)                               */
/*  success   #248A3D  availability dot                                       */
/* -------------------------------------------------------------------------- */

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif`

/* Critically damped springs: nothing here carries momentum, so nothing
   overshoots. They retarget from the live value, so opening and closing the
   menu can be interrupted at any moment without a jump. */
const PRESS_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.3 }

const SETTLE_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.45 }

/* Press feedback begins on pointer-down and is reversible mid-press. */
const PRESS = {
  whileTap: { scale: 0.97 },
  transition: PRESS_SPRING
} as const

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96600F]'

const BTN_BASE = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] transition-colors duration-200 ${FOCUS}`

const BTN_PRIMARY = 'bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'

const BTN_SECONDARY = 'bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10'

/* Translucent chrome. Solid when transparency is reduced. */
const CHROME_SCROLLED =
  'bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-black/[0.06] py-3 [@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none'

const CHROME_TOP = 'bg-transparent border-transparent py-5'

const MENU_SHEET =
  'bg-white/80 backdrop-blur-2xl backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none'

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
    // Reduced motion: transforms are dropped, opacity fades are kept.
    <MotionConfig reducedMotion='user'>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,padding,border-color] duration-300 border-b antialiased ${
          isScrolled ? CHROME_SCROLLED : CHROME_TOP
        }`}
        style={{ fontFamily: FONT_STACK }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          y: SETTLE_SPRING,
          opacity: { duration: 0.4, ease: 'easeOut' }
        }}
      >
        <div className='max-w-6xl mx-auto px-6 flex items-center justify-between'>
          <Link
            to='/'
            className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`}
          >
            <div
              className='w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-black/[0.06]'
              aria-hidden='true'
            >
              <img src='/logo.png' alt='' className='w-8' />
            </div>
            <span className='text-[1.0625rem] font-semibold text-[#1D1D1F] tracking-[-0.015em]'>
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
                  className={`rounded-md text-[0.9375rem] font-medium tracking-[-0.005em] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors duration-200 ${FOCUS}`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`rounded-md text-[0.9375rem] font-medium tracking-[-0.005em] transition-colors duration-200 ${FOCUS} ${
                    isActive
                      ? 'text-[#96600F]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className='hidden md:flex items-center gap-3'>
            <motion.a
              href={WA_HREF}
              target='_blank'
              rel='noopener noreferrer'
              {...PRESS}
              className={`min-h-10 px-4 text-sm ${BTN_BASE} ${BTN_SECONDARY}`}
              aria-label='Contactar por WhatsApp al 312 322 2128'
            >
              <span
                aria-hidden='true'
                className='w-2 h-2 rounded-full bg-[#248A3D]'
              />
              312 322 2128
            </motion.a>

            <motion.a
              href={WA_HREF}
              target='_blank'
              rel='noopener noreferrer'
              {...PRESS}
              className={`group min-h-10 px-5 text-sm ${BTN_BASE} ${BTN_PRIMARY}`}
            >
              WhatsApp
              <ArrowRight
                size={14}
                aria-hidden='true'
                className='group-hover:translate-x-0.5 transition-transform duration-150'
              />
            </motion.a>
          </div>

          <motion.button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            {...PRESS}
            className={`md:hidden flex h-11 w-11 items-center justify-center rounded-full bg-black/[0.06] text-[#1D1D1F] transition-colors duration-200 hover:bg-black/10 ${FOCUS}`}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed inset-x-0 top-[57px] bottom-0 z-40 md:hidden px-6 pt-14 pb-8 flex flex-col justify-between antialiased ${MENU_SHEET}`}
            style={{ fontFamily: FONT_STACK }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              y: SETTLE_SPRING,
              opacity: { duration: 0.25, ease: 'easeOut' }
            }}
          >
            <div className='flex flex-col gap-2'>
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
                    className={`rounded-lg py-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[#1D1D1F] ${FOCUS}`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => handleLinkClick(false)}
                    className={`rounded-lg py-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] ${FOCUS} ${
                      isActive ? 'text-[#96600F]' : 'text-[#1D1D1F]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className='flex flex-col gap-3'>
              <motion.a
                href={WA_HREF}
                target='_blank'
                rel='noopener noreferrer'
                {...PRESS}
                className={`min-h-12 w-full text-[1.0625rem] ${BTN_BASE} ${BTN_SECONDARY}`}
              >
                WhatsApp · 312 322 2128
              </motion.a>

              <motion.a
                href={WA_HREF}
                target='_blank'
                rel='noopener noreferrer'
                {...PRESS}
                className={`min-h-12 w-full text-[1.0625rem] ${BTN_BASE} ${BTN_PRIMARY}`}
              >
                Cotizar ahora
              </motion.a>

              <p className='pt-2 text-center text-[0.8125rem] tracking-[0.01em] text-[#6E6E73]'>
                {BRAND_NAME} · Iluminación y fabricación premium en Colombia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}