import { useRef, type ReactNode } from 'react'

import { Link } from 'react-router-dom'

import {
  motion,
  MotionConfig,
  useInView,
  type Transition,
  type Variants,
} from 'framer-motion'

import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Lightbulb,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'

import HeroScene from '@/components/HeroScene'

import WhatsAppFAB from '@/components/WhatsAppFAB'

import { PHONE_NUMBER } from '@/utils/config'

const WA_MESSAGE =
  'Hola! Estoy interesado en una de sus lámparas. ¿Podrían darme más información?'

const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

/* -------------------------------------------------------------------------- */
/*  Motion                                                                    */
/*  Springs, critically damped (no bounce): nothing here carries momentum,    */
/*  so nothing overshoots. Springs retarget from the live value, so any       */
/*  animation can be interrupted without a jump.                              */
/* -------------------------------------------------------------------------- */

/** Press feedback: starts on pointer-down, instant and reversible. */
const PRESS_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.3 }

/** Entrance: y settles on a spring, opacity follows a short ease. */
const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      y: { type: 'spring', bounce: 0, duration: 0.6, delay },
      opacity: { duration: 0.4, ease: 'easeOut', delay },
    },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/*  ink       #1D1D1F  primary text / primary button                          */
/*  muted     #6E6E73  secondary text                                         */
/*  surface   #F5F5F7  grouped background                                     */
/*  accent    #C98A2E  brand fill (glow, icon tint)                           */
/*  accent-tx #96600F  brand text (passes AA on white and on surface)         */
/* -------------------------------------------------------------------------- */

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96600F]'

const BTN_BASE = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] transition-colors duration-200 ${FOCUS}`

const BTN_PRIMARY = 'bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'

const BTN_SECONDARY = 'bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10'

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const inView = useInView(ref, {
    once: true,
    margin: '-72px',
  })

  return (
    <motion.div
      ref={ref}
      custom={delay}
      variants={rise}
      initial='hidden'
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const STATS = [
  {
    value: 'Premium',
    label: 'Calidad de fabricación',
  },
  {
    value: '100%',
    label: 'Control de calidad',
  },
  {
    value: '1–3 días',
    label: 'Preparación del pedido',
  },
  {
    value: 'CO',
    label: 'Envíos a toda Colombia',
  },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Diseño que transforma',
    body: 'Lámparas con una estética cuidada para convertirse en parte protagonista de tu espacio.',
  },
  {
    icon: ShieldCheck,
    title: 'Calidad controlada',
    body: 'Cada unidad pasa por una revisión antes de ser empacada para mantener un acabado consistente.',
  },
  {
    icon: PackageCheck,
    title: 'Fabricación bajo pedido',
    body: 'Producimos cada lámpara para tu compra y la preparamos con cuidado antes del despacho.',
  },
]

const PROCESS = [
  {
    step: '01',
    title: 'Elige tu lámpara',
    body: 'Explora la colección y encuentra el diseño que mejor encaja con tu espacio.',
  },
  {
    step: '02',
    title: 'Compra con confianza',
    body: 'Selecciona las opciones disponibles y completa tu pedido de forma segura.',
  },
  {
    step: '03',
    title: 'La fabricamos',
    body: 'Producimos tu lámpara bajo pedido y verificamos el resultado antes del envío.',
  },
  {
    step: '04',
    title: 'La recibes',
    body: 'La empacamos cuidadosamente y coordinamos el despacho hasta tu dirección.',
  },
]

const TRUST = [
  {
    icon: ShieldCheck,
    title: 'Calidad verificada',
    body: 'Revisión antes del despacho.',
  },
  {
    icon: Truck,
    title: 'Envíos nacionales',
    body: 'Despachamos a toda Colombia.',
  },
  {
    icon: Clock3,
    title: 'Producción bajo pedido',
    body: 'Cada compra se fabrica para ti.',
  },
]

const SERVICES = [
  {
    icon: ShieldCheck,
    title: 'Control de calidad',
    body: 'Revisamos cada unidad antes del despacho.',
  },
  {
    icon: PackageCheck,
    title: 'Empaque cuidado',
    body: 'Preparamos tu lámpara para un traslado seguro.',
  },
  {
    icon: Truck,
    title: 'Envíos nacionales',
    body: 'Despachos disponibles dentro de Colombia.',
  },
]

/** Sentence case, no tracking: the eyebrow is a quiet signpost, not a banner. */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className='mb-3 text-[1.0625rem] font-semibold leading-snug text-[#96600F]'>
      {children}
    </p>
  )
}

/** Large display type: tight leading, negative tracking. */
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[#1D1D1F]'>
      {children}
    </h2>
  )
}

function Accent({ children }: { children: ReactNode }) {
  return <span className='text-[#96600F]'>{children}</span>
}

/** Tinted icon tile: color sits on a soft solid layer, not on the page. */
function IconTile({
  icon: Icon,
  size = 'md',
}: {
  icon: typeof Sparkles
  size?: 'md' | 'lg'
}) {
  const box = size === 'lg' ? 'h-12 w-12 rounded-[14px]' : 'h-11 w-11 rounded-xl'

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-[#C98A2E]/15 text-[#96600F] ${box}`}
    >
      <Icon className='h-5 w-5' aria-hidden='true' />
    </div>
  )
}

function WAIcon({ className }: { className?: string }) {
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

function WAButton({
  size = 'md',
  label = 'Consultar por WhatsApp',
}: {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}) {
  // Every size keeps a 44pt minimum hit target.
  const sizes = {
    sm: 'min-h-11 px-4 text-sm',
    md: 'min-h-11 px-5 text-[0.9375rem]',
    lg: 'min-h-12 px-6 text-[1.0625rem]',
  }

  return (
    <motion.a
      href={WA_HREF}
      target='_blank'
      rel='noopener noreferrer'
      className={`${BTN_BASE} ${BTN_SECONDARY} ${sizes[size]}`}
      whileTap={{ scale: 0.97 }}
      transition={PRESS_SPRING}
    >
      <WAIcon className='h-[1.125rem] w-[1.125rem] shrink-0' />
      {label}
    </motion.a>
  )
}

export default function Landing() {
  return (
    // Reduced motion: transforms are dropped, opacity fades are kept.
    <MotionConfig reducedMotion='user'>
      <div
        className='relative min-h-screen overflow-x-hidden bg-white text-[#1D1D1F] antialiased [font-optical-sizing:auto]'
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* HERO */}
        <section className='relative overflow-hidden bg-white px-6 py-16 sm:py-20 lg:min-h-[92vh] lg:py-10'>
          {/* One soft glow behind the lamp: the only decoration. */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'radial-gradient(circle at 78% 48%, rgba(255,190,83,0.16) 0%, rgba(255,255,255,0) 36%)',
            }}
          />

          <div className='relative z-10 mx-auto grid min-h-[72vh] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-4'>
            <motion.div
              className='order-1 flex w-full flex-col items-center text-center lg:items-start lg:text-left'
              variants={stagger}
              initial='hidden'
              animate='visible'
            >
              <motion.div
                variants={rise}
                className='mb-6 inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] text-[#96600F]'
              >
                <Lightbulb className='h-3.5 w-3.5' aria-hidden='true' />
                Colección de iluminación
              </motion.div>

              <motion.h1
                variants={rise}
                className='max-w-2xl text-[clamp(2.75rem,7vw,5.25rem)] font-semibold leading-[1.04] tracking-[-0.03em]'
              >
                Luz que convierte
                <span className='block text-[#96600F]'>
                  espacios en experiencias.
                </span>
              </motion.h1>

              <motion.p
                variants={rise}
                className='mt-6 max-w-xl text-[1.0625rem] leading-[1.47] text-[#6E6E73] sm:text-[1.3125rem] sm:leading-[1.38]'
              >
                Lámparas comerciales de alta calidad, fabricadas bajo pedido y
                pensadas para destacar en hogares, negocios y espacios
                profesionales.
              </motion.p>

              <motion.div
                variants={rise}
                className='mt-9 flex flex-col items-center gap-3 sm:flex-row'
              >
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  transition={PRESS_SPRING}
                >
                  <Link
                    to='/catalog'
                    className={`group min-h-12 px-6 text-[1.0625rem] ${BTN_BASE} ${BTN_PRIMARY}`}
                  >
                    Ver colección
                    <ArrowRight
                      className='h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5'
                      aria-hidden='true'
                    />
                  </Link>
                </motion.div>

                <WAButton size='lg' label='Habla con nosotros' />
              </motion.div>

              <motion.dl
                variants={rise}
                className='mt-12 grid w-full max-w-xl grid-cols-2 gap-x-4 gap-y-6 rounded-[28px] bg-[#F5F5F7] p-6 text-left sm:grid-cols-4'
              >
                {STATS.map((s) => (
                  <div key={s.label} className='flex flex-col-reverse'>
                    <dt className='mt-1 text-[0.8125rem] leading-snug tracking-[0.01em] text-[#6E6E73]'>
                      {s.label}
                    </dt>

                    <dd className='text-xl font-semibold tracking-[-0.02em] text-[#96600F] sm:text-2xl'>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </motion.div>

            <div className='order-2 flex min-h-[430px] w-full items-center justify-center lg:min-h-[680px]'>
              <HeroScene />
            </div>
          </div>

          <motion.div
            aria-hidden='true'
            className='absolute bottom-7 left-1/2 -translate-x-1/2 text-[#6E6E73]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <ChevronDown className='h-5 w-5' />
          </motion.div>
        </section>

        {/* TRUST STRIP */}
        <section className='bg-[#F5F5F7]'>
          <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-3 sm:gap-8'>
            {TRUST.map(({ icon, title, body }) => (
              <div key={title} className='flex items-center gap-4'>
                <IconTile icon={icon} />

                <div>
                  <div className='text-[0.9375rem] font-semibold leading-snug text-[#1D1D1F]'>
                    {title}
                  </div>

                  <div className='mt-0.5 text-[0.9375rem] leading-snug text-[#6E6E73]'>
                    {body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className='mx-auto max-w-7xl px-6 py-24 sm:py-28'>
          <Reveal className='mx-auto max-w-3xl text-center'>
            <SectionLabel>La diferencia</SectionLabel>

            <SectionHeading>
              Una lámpara debe verse bien.
              <span className='block'>
                También debe <Accent>sentirse bien hecha.</Accent>
              </span>
            </SectionHeading>

            <p className='mx-auto mt-5 max-w-2xl text-[1.0625rem] leading-[1.47] text-[#6E6E73] sm:text-xl sm:leading-[1.4]'>
              Nuestra propuesta combina diseño contemporáneo, fabricación
              consistente y una experiencia de compra clara de principio a fin.
            </p>
          </Reveal>

          <motion.div
            className='mt-14 grid grid-cols-1 gap-5 md:grid-cols-3'
            variants={stagger}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURES.map((feature) => (
              <motion.article
                key={feature.title}
                variants={rise}
                className='rounded-[28px] bg-[#F5F5F7] p-8'
              >
                <IconTile icon={feature.icon} size='lg' />

                <h3 className='mt-8 text-2xl font-semibold leading-[1.15] tracking-[-0.015em] text-[#1D1D1F]'>
                  {feature.title}
                </h3>

                <p className='mt-3 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                  {feature.body}
                </p>

                <div className='mt-7 flex items-center gap-2 text-[0.9375rem] font-medium text-[#96600F]'>
                  <Check className='h-4 w-4' aria-hidden='true' />
                  Hecho para durar en tu espacio
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* PROCESS */}
        <section className='bg-[#F5F5F7] px-6 py-24 sm:py-28'>
          <div className='mx-auto max-w-6xl'>
            <Reveal className='max-w-3xl'>
              <SectionLabel>Proceso</SectionLabel>

              <SectionHeading>
                Compra simple.
                <span className='block'>
                  Fabricación <Accent>cuidada.</Accent>
                </span>
              </SectionHeading>
            </Reveal>

            <motion.ol
              className='mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
              variants={stagger}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, margin: '-60px' }}
            >
              {PROCESS.map((item) => (
                <motion.li
                  key={item.step}
                  variants={rise}
                  className='rounded-[28px] bg-white p-7'
                >
                  <div className='text-4xl font-semibold tracking-[-0.025em] text-[#96600F]'>
                    {item.step}
                  </div>

                  <h3 className='mt-8 text-xl font-semibold leading-[1.2] tracking-[-0.01em] text-[#1D1D1F]'>
                    {item.title}
                  </h3>

                  <p className='mt-3 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                    {item.body}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* CONTACT */}
        <section id='contact' className='bg-white px-6 py-24 sm:py-28'>
          <div className='mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
            <Reveal>
              <SectionLabel>Atención directa</SectionLabel>

              <SectionHeading>
                Encuentra la lámpara que
                <span className='block'>
                  haga <Accent>especial tu espacio.</Accent>
                </span>
              </SectionHeading>

              <p className='mt-5 max-w-xl text-[1.0625rem] leading-[1.47] text-[#6E6E73] sm:text-xl sm:leading-[1.4]'>
                Explora nuestra colección o escríbenos para recibir orientación
                sobre modelos, opciones y disponibilidad.
              </p>

              <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                <motion.div
                  className='flex'
                  whileTap={{ scale: 0.97 }}
                  transition={PRESS_SPRING}
                >
                  <Link
                    to='/catalog'
                    className={`group w-full min-h-12 px-6 text-[1.0625rem] ${BTN_BASE} ${BTN_PRIMARY}`}
                  >
                    Explorar lámparas
                    <ArrowRight
                      className='h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5'
                      aria-hidden='true'
                    />
                  </Link>
                </motion.div>

                <motion.a
                  href={WA_HREF}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`min-h-12 px-6 text-[1.0625rem] ${BTN_BASE} ${BTN_SECONDARY}`}
                  whileTap={{ scale: 0.97 }}
                  transition={PRESS_SPRING}
                >
                  <MessageCircle className='h-4 w-4' aria-hidden='true' />
                  WhatsApp
                </motion.a>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className='overflow-hidden rounded-[28px] bg-[#F5F5F7]'>
                <div className='px-6 pb-4 pt-6'>
                  <div className='text-[0.9375rem] font-medium text-[#6E6E73]'>
                    Servicio
                  </div>

                  <div className='mt-1 text-2xl font-semibold leading-[1.15] tracking-[-0.015em] text-[#1D1D1F]'>
                    Compra con confianza
                  </div>
                </div>

                <div className='mx-6 divide-y divide-black/[0.06] pb-2'>
                  {SERVICES.map(({ icon, title, body }) => (
                    <div key={title} className='flex gap-4 py-5'>
                      <IconTile icon={icon} />

                      <div>
                        <div className='text-[0.9375rem] font-semibold leading-snug text-[#1D1D1F]'>
                          {title}
                        </div>

                        <div className='mt-1 text-[0.9375rem] leading-[1.45] text-[#6E6E73]'>
                          {body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <WhatsAppFAB />
      </div>
    </MotionConfig>
  )
}