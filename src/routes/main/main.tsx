import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  Layers,
  Zap,
  Package,
  Clock,
  ChevronDown,
  MessageCircle
} from 'lucide-react'
import HeroScene from '@/components/HeroScene'
import WhatsAppFAB from '@/components/WhatsAppFAB'
import { PHONE_NUMBER } from '@/utils/config'
// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const WA_MESSAGE =
  'Hola! Estoy interesado en uno de sus productos. ¿Podrían darme más información?'
const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
  WA_MESSAGE
)}`

// ─────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }
  })
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

// ─────────────────────────────────────────────────────────────
// Scroll-triggered wrapper
// ─────────────────────────────────────────────────────────────
function Reveal ({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-72px' })
  return (
    <motion.div
      ref={ref}
      custom={delay}
      variants={fadeUp}
      initial='hidden'
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '+500', label: 'Piezas entregadas' },
  { value: '100%', label: 'Satisfacción garantizada' },
  { value: '48h', label: 'Entrega en Colombia' },
  { value: '2h', label: 'Cotización rápida' }
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Entrega a todo el país',
    body: 'Prototipos listos para toda Colombia. Envíos nacionales con seguimiento y seguro incluido.'
  },
  {
    icon: Layers,
    title: 'Amplio catálogo',
    body: 'Personaliza tus piezas (imanes, llaveros, lámparas) o elige entre los modelos disponibles.'
  },
  {
    icon: Package,
    title: 'Desde 1 unidad',
    body: 'Una pieza o cientos. Fabricamos experiencias, momentos y productos empresariales con la misma calidad y atención al detalle.'
  }
]

const PROCESS = [
  {
    step: '01',
    title: 'Contáctanos',
    body: 'Envíanos tu producto deseado desde nuestro catálogo o tu propia idea.'
  },
  {
    step: '02',
    title: 'Cotizamos',
    body: 'Te respondemos con la mayor calidad y rapidez.'
  },
  {
    step: '03',
    title: 'Lo recibes',
    body: 'Entrega a domicilio en Colombia. Garantía de reimpresión incluida.'
  }
]

// ─────────────────────────────────────────────────────────────
// Shared micro-components
// ─────────────────────────────────────────────────────────────
function SectionLabel ({ children }: { children: React.ReactNode }) {
  return (
    <p
      className='text-[11px] font-bold uppercase tracking-[0.18em] mb-3'
      style={{ color: '#1E4FD8' }}
    >
      {children}
    </p>
  )
}

function SectionHeading ({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className='text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.08] tracking-tight'
      style={{ fontFamily: 'var(--font-display)', color: '#E2E8F5' }}
    >
      {children}
    </h2>
  )
}

function Accent ({ children }: { children: React.ReactNode }) {
  return <span className='text-[#1E4FD8]'>{children}</span>
}

function WAButton ({
  size = 'md',
  label = 'Cotizar por WhatsApp'
}: {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}) {
  const paddings = { sm: 'px-5 py-2.5', md: 'px-6 py-3.5', lg: 'px-8 py-4' }
  const texts = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  return (
    <motion.a
      href={WA_HREF}
      target='_blank'
      rel='noopener noreferrer'
      className={`
        inline-flex items-center gap-2.5 rounded-lg font-semibold
        bg-[#25D366] hover:bg-[#1ebe5d] text-white
        transition-colors duration-200 shadow-lg shadow-[#25D366]/20
        ${paddings[size]} ${texts[size]}
      `}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <WAIcon className='w-4 h-4 shrink-0' />
      {label}
    </motion.a>
  )
}

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
// Main component
// ─────────────────────────────────────────────────────────────
export default function Landing () {
  return (
    <div
      className='relative min-h-screen overflow-x-hidden'
      style={{ background: '#080B12' }}
    >
      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section
        className='relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6'
        style={{ background: '#04060C' }}
      >
        {/* Three.js particle field fills the whole section */}
        <HeroScene />

        {/* Technical grid overlay */}
        <div
          aria-hidden='true'
          className='absolute inset-0 pointer-events-none opacity-[0.032]'
          style={{
            backgroundImage: [
              'linear-gradient(rgba(30,79,216,1) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(30,79,216,1) 1px, transparent 1px)'
            ].join(', '),
            backgroundSize: '72px 72px'
          }}
        />

        {/* Brand radial bloom */}
        <div
          aria-hidden='true'
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(30,79,216,0.10) 0%, transparent 68%)'
          }}
        />

        {/* ── Content ── */}
        <motion.div
          className='relative z-10 max-w-4xl mx-auto flex flex-col items-center'
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
        >
          {/* Headline */}
          <motion.h1
            variants={cardVariant}
            className='text-5xl sm:text-6xl md:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tight leading-[1.02] mb-6'
            style={{ fontFamily: 'var(--font-display)', color: '#E2E8F5' }}
          >
            Tu idea hecha{' '}
            <span
              className='relative inline-block'
              style={{ color: '#1E4FD8' }}
            >
              pieza real
              <motion.span
                aria-hidden='true'
                className='absolute left-0 -bottom-1 h-[3px] rounded-full'
                style={{
                  background: 'linear-gradient(90deg, #1E4FD8, #5C8AFF)'
                }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{
                  delay: 1.0,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1]
                }}
              />
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={cardVariant}
            className='text-lg sm:text-xl max-w-2xl leading-relaxed mb-10'
            style={{ color: '#6A80B0' }}
          >
            Diseñamos, fabricamos y entregamos piezas personalizadas para
            empresas y particulares. Desde prototipos hasta productos finales,
            con la mejor calidad y rapidez.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={cardVariant}
            className='flex flex-col sm:flex-row gap-3 items-center'
          >
            {/* Primary — catalog */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to='/catalog'
                className='
                  group inline-flex items-center gap-2
                  px-7 py-3.5 rounded-lg
                  bg-[#1E4FD8] hover:bg-[#2A5FE8] text-white
                  font-semibold text-base
                  transition-colors duration-200
                  shadow-xl shadow-[#1E4FD8]/30
                '
              >
                Ver catálogo
                <ArrowRight
                  size={16}
                  className='group-hover:translate-x-0.5 transition-transform duration-150'
                />
              </Link>
            </motion.div>

            {/* Secondary — WhatsApp */}
            <WAButton size='md' label='Cotizar ahora' />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          aria-hidden='true'
          className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span
            className='text-[9px] font-bold tracking-[0.22em] uppercase'
            style={{ color: '#2D3F60' }}
          >
            Scroll
          </span>
          <ChevronDown
            size={14}
            style={{ color: '#2D3F60' }}
            className='animate-bounce'
          />
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════ */}
      <section
        className='border-y border-[#1A2440]'
        style={{ background: '#0A0F1E' }}
      >
        <motion.div
          className='max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4'
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-50px' }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i * 0.08}
              variants={fadeUp}
              className='flex flex-col items-center text-center gap-1.5'
            >
              <span
                className='text-4xl font-black tabular-nums'
                style={{ fontFamily: 'var(--font-display)', color: '#1E4FD8' }}
              >
                {s.value}
              </span>
              <span
                className='text-xs font-medium uppercase tracking-wider'
                style={{ color: '#4A6090' }}
              >
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════════════════ */}
      <section className='max-w-6xl mx-auto px-6 py-28'>
        <Reveal className='text-center mb-14'>
          <SectionHeading>
            Diseño, entretenimiento y personalización{' '}
            <Accent>sin límites</Accent>
          </SectionHeading>
        </Reveal>

        <motion.div
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={cardVariant}
                className='
                  group relative overflow-hidden
                  rounded-xl border border-[#1A2440]
                  bg-[#0A0F1E] hover:border-[#1E4FD8]/40
                  p-6
                  transition-all duration-300 hover:-translate-y-0.5
                '
              >
                {/* Blue top accent line on hover */}
                <span
                  aria-hidden='true'
                  className='
                    absolute top-0 inset-x-0 h-[2px] rounded-t-xl
                    bg-gradient-to-r from-[#1E4FD8] to-[#5C8AFF]
                    scale-x-0 group-hover:scale-x-100
                    transition-transform duration-300 origin-left
                  '
                />

                {/* Icon */}
                <div
                  className='
                  w-10 h-10 rounded-lg mb-5
                  bg-[#0D1730] border border-[#1A2440]
                  group-hover:border-[#1E4FD8]/30
                  flex items-center justify-center
                  transition-colors duration-300
                '
                >
                  <Icon size={18} style={{ color: '#1E4FD8' }} />
                </div>

                <h3
                  className='font-semibold text-[15px] mb-2 leading-snug'
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#D0DCF4'
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className='text-sm leading-relaxed'
                  style={{ color: '#4A6890' }}
                >
                  {f.body}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          PROCESS
      ════════════════════════════════════════════════════ */}
      <section className='py-28 px-6' style={{ background: '#080B12' }}>
        <div className='max-w-6xl mx-auto'>
          <Reveal className='text-center mb-16'>
            <SectionLabel>Proceso</SectionLabel>
            <SectionHeading>
              De tu idea a tus manos <Accent>en {PROCESS.length} pasos</Accent>
            </SectionHeading>
          </Reveal>

          <motion.div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${PROCESS.length} gap-8`}
            variants={staggerContainer}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
          >
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.step}
                variants={cardVariant}
                className='relative flex flex-col gap-5'
              >
                {/* Dashed connector (desktop only, not last) */}
                {i < PROCESS.length - 1 && (
                  <div
                    aria-hidden='true'
                    className='
                      hidden lg:block absolute
                      top-5 left-[calc(100%_-_10px)]
                      w-full h-px
                      border-t border-dashed border-[#1E2D50]
                      pointer-events-none
                    '
                  />
                )}

                {/* Step circle */}
                <div
                  className='
                    w-11 h-11 rounded-full shrink-0
                    border-2 border-[#1E4FD8]
                    flex items-center justify-center
                    text-xs font-black tracking-wider
                  '
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#1E4FD8',
                    background: 'rgba(30,79,216,0.08)'
                  }}
                >
                  {p.step}
                </div>

                <div>
                  <h3
                    className='font-semibold text-[15px] mb-2'
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: '#D0DCF4'
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className='text-sm leading-relaxed'
                    style={{ color: '#4A6090' }}
                  >
                    {p.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* ════════════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════════════ */}
      <section
        id='contact'
        className='py-24 px-6 border-t border-[#1A2440]'
        style={{ background: '#080B12' }}
      >
        <div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center'>
          <Reveal>
            <SectionLabel>Contacto directo</SectionLabel>
            <SectionHeading>
              ¿Tienes un <Accent>proyecto?</Accent>
            </SectionHeading>
            <p
              className='mt-4 text-base leading-relaxed mb-8 max-w-sm'
              style={{ color: '#6A80B0' }}
            >
              Cuéntanos qué necesitas. En menos de 2 horas tienes cotización,
              material ideal y tiempo de entrega. Sin formularios, sin esperas.
            </p>

            <WAButton size='lg' label='Escríbenos en WhatsApp' />
          </Reveal>

          {/* Info cards */}
          <Reveal delay={0.15}>
            <div className='flex flex-col gap-4'>
              {[
                {
                  icon: Clock,
                  label: 'Horario de atención',
                  value:
                    'Disponible de lunes a viernes, de 9:00 a.m. a 6:00 p.m.'
                },
                {
                  icon: MessageCircle,
                  label: 'Tiempo de respuesta',
                  value: 'Cotización en menos de 2 horas hábiles'
                },
                {
                  icon: Package,
                  label: 'Área de servicio',
                  value: 'Colombia · envíos nacionales a todo el país'
                }
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className='
                    flex items-start gap-4 px-5 py-4
                    rounded-xl border border-[#1A2440]
                    bg-[#0A0F1E]
                  '
                >
                  <div
                    className='
                    w-9 h-9 rounded-lg shrink-0 mt-0.5
                    bg-[#0D1730] border border-[#1A2440]
                    flex items-center justify-center
                  '
                  >
                    <Icon size={15} style={{ color: '#1E4FD8' }} />
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    <span
                      className='text-[10px] font-bold uppercase tracking-wider'
                      style={{ color: '#1E4FD8' }}
                    >
                      {label}
                    </span>
                    <span className='text-sm' style={{ color: '#B0C0DC' }}>
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Persistent WhatsApp FAB */}
      <WhatsAppFAB />
    </div>
  )
}
