import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, ShieldCheck, Zap } from 'lucide-react'
import { Linkedin, Instagram } from '@/utils/Logos'
import { BRAND_NAME, PHONE_NUMBER } from '@/utils/config'
const WA_MESSAGE = 'Hola! Estoy interesado en cotizar una pieza 3D.'
const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
  WA_MESSAGE
)}`

// ─────────────────────────────────────────────────────────────
// Reusable Link Component with Hover Animation
// ─────────────────────────────────────────────────────────────
function FooterLink ({
  to,
  href,
  children
}: {
  to?: string
  href?: string
  children: React.ReactNode
}) {
  const content = (
    <motion.span
      className='inline-flex items-center gap-2 text-sm text-[#6A80B0] hover:text-[#D0DCF4] transition-colors cursor-pointer group'
      whileHover={{ x: 4 }}
    >
      <ArrowRight
        size={12}
        className='text-[#1E4FD8] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300'
      />
      {children}
    </motion.span>
  )
  if (to) return <Link to={to}>{content}</Link>
  return <a href={href}>{content}</a>
}

export default function Footer () {
  return (
    <footer
      className='relative border-t border-[#1A2440] overflow-hidden'
      style={{ background: '#04060C' }}
    >
      {/* ── BACKGROUND EFFECTS ── */}
      <div
        aria-hidden='true'
        className='absolute inset-0 pointer-events-none opacity-[0.02]'
        style={{
          backgroundImage: [
            'linear-gradient(rgba(30,79,216,1) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(30,79,216,1) 1px, transparent 1px)'
          ].join(', '),
          backgroundSize: '48px 48px'
        }}
      />
      <div
        aria-hidden='true'
        className='absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none rounded-full blur-[120px]'
        style={{
          background:
            'radial-gradient(circle, rgba(30,79,216,0.03) 0%, transparent 70%)'
        }}
      />

      {/* ── MAIN CONTENT GRID ── */}
      <div className='relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16'>
          {/* 1. Brand & Lead Gen (Spans 4 cols) */}
          <div className='lg:col-span-4 flex flex-col gap-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-[#1E4FD8] flex items-center justify-center shadow-lg shadow-[#1E4FD8]/20'>
                <svg viewBox='0 0 20 22' fill='none' className='w-4 h-4'>
                  <path
                    d='M10 1L18 4.5V10C18 14.5 14.5 18.5 10 21C5.5 18.5 2 14.5 2 10V4.5L10 1Z'
                    fill='white'
                    opacity='0.92'
                  />
                  <path
                    d='M10 5L14 7.5V10.5C14 12.8 12.2 14.8 10 16C7.8 14.8 6 12.8 6 10.5V7.5L10 5Z'
                    fill='#1E4FD8'
                  />
                </svg>
              </div>
              <span
                className='text-xl font-bold text-white tracking-wide uppercase'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {BRAND_NAME}
              </span>
            </div>

            <p className='text-sm leading-relaxed text-[#6A80B0] max-w-sm'>
              Ingeniería y manufactura aditiva. Fabricamos piezas funcionales,
              prototipos de alta precisión y series de producción con tiempos de
              entrega insuperables.
            </p>

            {/* B2B Newsletter / Contact Box */}
            <div className='mt-2 p-5 rounded-xl border border-[#1A2440] bg-[#0A0F1E]/50 backdrop-blur-sm'>
              <div className='flex items-center gap-2 mb-3'>
                <Zap size={14} className='text-[#1E4FD8]' />
                <span className='text-xs font-bold uppercase tracking-wider text-[#D0DCF4]'>
                  Guía de Tolerancias 3D
                </span>
              </div>
              <p className='text-xs text-[#4A6090] mb-4'>
                Déjanos tu correo y recibe gratis nuestra guía de diseño para
                manufactura aditiva.
              </p>
              <form className='flex gap-2' onSubmit={e => e.preventDefault()}>
                <input
                  type='email'
                  placeholder='tu@empresa.com'
                  className='w-full bg-[#04060C] border border-[#1A2440] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4A6090] focus:outline-none focus:border-[#1E4FD8] transition-colors'
                />
                <button
                  type='submit'
                  className='bg-[#1E4FD8] hover:bg-[#2A5FE8] text-white rounded-md px-3 py-2 transition-colors flex items-center justify-center shrink-0'
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* 2. Soluciones (Spans 2 cols) */}
          <div className='lg:col-span-2 lg:col-start-6 flex flex-col gap-5'>
            <span className='text-xs font-bold uppercase tracking-[0.15em] text-[#E2E8F5]'>
              Soluciones
            </span>
            <ul className='flex flex-col gap-3.5'>
              <li>
                <FooterLink to='/catalog'>Catálogo 3D</FooterLink>
              </li>
              <li>
                <FooterLink href='#services'>Prototipado Rápido</FooterLink>
              </li>
              <li>
                <FooterLink href='#services'>Producción en Serie</FooterLink>
              </li>
              <li>
                <FooterLink href='#materials'>Guía de Materiales</FooterLink>
              </li>
            </ul>
          </div>

          {/* 3. Empresa (Spans 2 cols) */}
          <div className='lg:col-span-2 flex flex-col gap-5'>
            <span className='text-xs font-bold uppercase tracking-[0.15em] text-[#E2E8F5]'>
              Empresa
            </span>
            <ul className='flex flex-col gap-3.5'>
              <li>
                <FooterLink href='#'>Casos de Éxito</FooterLink>
              </li>
              <li>
                <FooterLink href='#'>Tiempos de Entrega</FooterLink>
              </li>
              <li>
                <FooterLink href='#'>Preguntas Frecuentes</FooterLink>
              </li>
              <li>
                <FooterLink href='#contact'>Contacto</FooterLink>
              </li>
            </ul>
          </div>

          {/* 4. Contacto Directo (Spans 3 cols) */}
          <div className='lg:col-span-3 flex flex-col gap-5'>
            <span className='text-xs font-bold uppercase tracking-[0.15em] text-[#E2E8F5]'>
              Atención al Cliente
            </span>

            <div className='flex flex-col gap-4 mt-1'>
              <a
                href={WA_HREF}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-start gap-3 p-3 rounded-lg border border-[#1A2440] bg-[#0A0F1E] hover:border-[#25D366]/40 transition-colors'
              >
                <div className='w-8 h-8 rounded-md bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='w-4 h-4 text-[#25D366]'
                  >
                    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                  </svg>
                </div>
                <div className='flex flex-col'>
                  <span className='text-xs font-bold text-white mb-0.5'>
                    WhatsApp Directo
                  </span>
                  <span className='text-[11px] text-[#6A80B0]'>
                    Cotiza en menos de 2 horas
                  </span>
                </div>
              </a>

              <div className='flex items-center gap-3 text-sm text-[#6A80B0]'>
                <Mail size={16} className='text-[#1E4FD8]' />
                <a
                  href='mailto:cotizaciones@vanguard.com'
                  className='hover:text-white transition-colors'
                >
                  cotizaciones@vanguard.com
                </a>
              </div>

              <div className='flex items-start gap-3 text-sm text-[#6A80B0]'>
                <MapPin size={16} className='text-[#1E4FD8] shrink-0 mt-0.5' />
                <span className='text-sm'>
                  Envíos a nivel nacional.
                  <br />
                  Operando desde Colombia.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR (Legal & Socials) ── */}
      <div className='border-t border-[#0F1A30] bg-[#020308]'>
        <div className='max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2 text-[#4A6090]'>
            <ShieldCheck size={14} className='text-[#1E4FD8]' />
            <p className='text-xs'>
              © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos
              reservados.
            </p>
          </div>

          <div className='flex items-center gap-6 text-xs text-[#4A6090]'>
            <a href='#' className='hover:text-white transition-colors'>
              Términos Comerciales
            </a>
            <a href='#' className='hover:text-white transition-colors'>
              Política de Privacidad
            </a>

            {/* Redes Sociales */}
            <div className='flex items-center gap-3 ml-2 pl-6 border-l border-[#1A2440]'>
              <motion.a
                whileHover={{ y: -2 }}
                href='#'
                className='text-[#6A80B0] hover:text-[#E2E8F5] transition-colors'
              >
                <Linkedin size={16} />
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href='#'
                className='text-[#6A80B0] hover:text-[#E2E8F5] transition-colors'
              >
                <Instagram size={16} />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
