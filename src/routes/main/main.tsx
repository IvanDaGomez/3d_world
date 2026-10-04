import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
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
import { cardVariant, fadeUp, stagger } from '../catalog/ui/variants'

const WA_MESSAGE =
  'Hola! Estoy interesado en una de sus lámparas. ¿Podrían darme más información?'
const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

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

const STATS = [
  { value: 'Premium', label: 'Calidad de fabricación' },
  { value: '100%', label: 'Control de calidad' },
  { value: '1–3 días', label: 'Preparación del pedido' },
  { value: 'CO', label: 'Envíos a toda Colombia' },
]

const FEATURES = [
  {
    icon: Sparkles,
    eyebrow: '01',
    title: 'Diseño que transforma',
    body: 'Lámparas con una estética cuidada para convertirse en parte protagonista de tu espacio.',
  },
  {
    icon: ShieldCheck,
    eyebrow: '02',
    title: 'Calidad controlada',
    body: 'Cada unidad pasa por una revisión antes de ser empacada para mantener un acabado consistente.',
  },
  {
    icon: PackageCheck,
    eyebrow: '03',
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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className='mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C98A2E]'>
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className='text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl'
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </h2>
  )
}

function Accent({ children }: { children: ReactNode }) {
  return <span className='text-[#C98A2E]'>{children}</span>
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
  const paddings = {
    sm: 'px-4 py-2.5',
    md: 'px-5 py-3',
    lg: 'px-6 py-3.5',
  }
  const texts = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <motion.a
      href={WA_HREF}
      target='_blank'
      rel='noopener noreferrer'
      className={`inline-flex items-center gap-2.5 rounded-full border border-[#D7A451] bg-transparent font-semibold text-[#FFF8EA] transition-colors duration-200 hover:bg-[#D7A451] hover:text-[#111318] ${paddings[size]} ${texts[size]}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <WAIcon className='h-4 w-4 shrink-0' />
      {label}
    </motion.a>
  )
}

export default function Landing() {
  return (
    <div className='relative min-h-screen overflow-x-hidden bg-[#F5F2EC] text-[#17191D]'>
      <section className='relative overflow-hidden bg-[#0D0F13] px-6 py-16 text-[#F7F5EF] sm:py-20 lg:min-h-[92vh] lg:py-10'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(circle at 78% 48%, rgba(255,190,83,0.2) 0%, rgba(13,15,19,0) 34%), linear-gradient(180deg, rgba(13,15,19,0.08), rgba(13,15,19,0.42))',
          }}
        />

        <div className='relative z-10 mx-auto grid min-h-[72vh] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-4'>
          <motion.div
            className='order-1 flex w-full flex-col items-center'
            variants={stagger}
            initial='hidden'
            animate='visible'
          >
            <motion.div
              variants={cardVariant}
              className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F6D79D] backdrop-blur'
            >
              <Lightbulb className='h-3.5 w-3.5' />
              Colección de iluminación
            </motion.div>

            <motion.h1
              variants={cardVariant}
              className='max-w-2xl text-5xl font-black tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[5.4rem]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Luz que convierte
              <span className='block text-[#D7A451]'>espacios en experiencias.</span>
            </motion.h1>

            <motion.p
              variants={cardVariant}
              className='mt-7 max-w-xl text-base leading-relaxed text-[#D7D4CE] sm:text-lg'
            >
              Lámparas comerciales de alta calidad, fabricadas bajo pedido y pensadas para destacar en hogares, negocios y espacios profesionales.
            </motion.p>

            <motion.div
              variants={cardVariant}
              className='mt-9 flex flex-col items-start gap-3 sm:flex-row'
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to='/catalog'
                  className='group inline-flex items-center gap-2.5 rounded-full bg-[#F7F5EF] px-6 py-3.5 text-sm font-bold text-[#111318] transition-colors duration-200 hover:bg-[#D7A451]'
                >
                  Ver colección
                  <ArrowRight className='h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5' />
                </Link>
              </motion.div>
              <WAButton label='Habla con nosotros' />
            </motion.div>

            <motion.div
              variants={cardVariant}
              className='mt-10 grid w-full max-w-xl grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur sm:grid-cols-4'
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-4 py-5 ${i > 0 ? 'border-white/10 sm:border-l' : ''} ${i > 1 ? 'border-t sm:border-t-0' : ''}`}
                >
                  <div
                    className='text-xl font-black tracking-tight text-[#F6D79D] sm:text-2xl'
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {s.value}
                  </div>
                  <div className='mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#A9A7A1]'>
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className='order-2 flex min-h-[430px] w-full items-center justify-center lg:min-h-[680px]'>
            <HeroScene />
          </div>
        </div>

        <motion.div
          aria-hidden='true'
          className='absolute bottom-7 left-1/2 -translate-x-1/2 text-[#9E9C96]'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <ChevronDown className='h-5 w-5 animate-bounce' />
        </motion.div>
      </section>

      <section className='border-y border-[#DED8CE] bg-[#FBF9F5]'>
        <div className='mx-auto grid max-w-6xl grid-cols-1 gap-0 px-6 sm:grid-cols-3'>
          {[
            { icon: ShieldCheck, title: 'Calidad verificada', body: 'Revisión antes del despacho.' },
            { icon: Truck, title: 'Envíos nacionales', body: 'Despachamos a toda Colombia.' },
            { icon: Clock3, title: 'Producción bajo pedido', body: 'Cada compra se fabrica para ti.' },
          ].map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className={`flex items-center gap-4 py-6 ${index > 0 ? 'border-[#DED8CE] sm:border-l sm:pl-8' : ''} ${index > 0 ? 'border-t sm:border-t-0' : ''}`}
            >
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17191D] text-[#F6D79D]'>
                <Icon className='h-5 w-5' />
              </div>
              <div>
                <div className='text-sm font-bold text-[#17191D]'>{title}</div>
                <div className='mt-0.5 text-sm text-[#6B6963]'>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-6 py-24 sm:py-28'>
        <Reveal className='mx-auto max-w-3xl text-center'>
          <SectionLabel>La diferencia</SectionLabel>
          <SectionHeading>
            Una lámpara debe verse bien.
            <span className='block'>También debe <Accent>sentirse bien hecha.</Accent></span>
          </SectionHeading>
          <p className='mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#66635D]'>
            Nuestra propuesta combina diseño contemporáneo, fabricación consistente y una experiencia de compra clara de principio a fin.
          </p>
        </Reveal>

        <motion.div
          className='mt-14 grid grid-cols-1 gap-5 md:grid-cols-3'
          variants={stagger}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                variants={cardVariant}
                className='group relative overflow-hidden rounded-3xl border border-[#DDD7CD] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#CFA45B] hover:shadow-[0_18px_50px_rgba(23,25,29,0.08)]'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17191D] text-[#F6D79D] transition-transform duration-300 group-hover:scale-105'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <span className='text-xs font-black tracking-[0.18em] text-[#B7B1A6]'>
                    {feature.eyebrow}
                  </span>
                </div>
                <h3
                  className='mt-8 text-2xl font-bold tracking-tight text-[#17191D]'
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {feature.title}
                </h3>
                <p className='mt-3 text-sm leading-7 text-[#69665F]'>{feature.body}</p>
                <div className='mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#C98A2E]'>
                  <Check className='h-4 w-4' />
                  Hecho para durar en tu espacio
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </section>

      <section className='bg-[#14161B] px-6 py-24 text-[#F7F5EF] sm:py-28'>
        <div className='mx-auto max-w-6xl'>
          <Reveal className='max-w-3xl'>
            <SectionLabel>Proceso</SectionLabel>
            <SectionHeading>
              Compra simple.
              <span className='block text-[#F7F5EF]'>Fabricación <Accent>cuidada.</Accent></span>
            </SectionHeading>
          </Reveal>

          <motion.div
            className='mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
            variants={stagger}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
          >
            {PROCESS.map((item) => (
              <motion.article
                key={item.step}
                variants={cardVariant}
                className='rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-[#D7A451]/50'
              >
                <div className='text-4xl font-black text-[#D7A451]' style={{ fontFamily: 'var(--font-display)' }}>
                  {item.step}
                </div>
                <h3 className='mt-8 text-xl font-bold text-white' style={{ fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p className='mt-3 text-sm leading-6 text-[#AAA7A0]'>{item.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id='contact' className='bg-[#F5F2EC] px-6 py-24 sm:py-28'>
        <div className='mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
          <Reveal>
            <SectionLabel>Atención directa</SectionLabel>
            <SectionHeading>
              Encuentra la lámpara que
              <span className='block'>haga <Accent>especial tu espacio.</Accent></span>
            </SectionHeading>
            <p className='mt-5 max-w-xl text-base leading-7 text-[#66635D]'>
              Explora nuestra colección o escríbenos para recibir orientación sobre modelos, opciones y disponibilidad.
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <Link
                to='/catalog'
                className='inline-flex items-center justify-center gap-2 rounded-full bg-[#17191D] px-6 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#30343B]'
              >
                Explorar lámparas
                <ArrowRight className='h-4 w-4' />
              </Link>
              <a
                href={WA_HREF}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center gap-2 rounded-full border border-[#BFB8AD] bg-transparent px-6 py-3.5 text-sm font-bold text-[#17191D] transition-colors duration-200 hover:border-[#17191D]'
              >
                <MessageCircle className='h-4 w-4' />
                WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className='overflow-hidden rounded-3xl border border-[#DCD5CA] bg-white'>
              <div className='border-b border-[#E7E1D7] px-6 py-5'>
                <div className='text-xs font-bold uppercase tracking-[0.16em] text-[#A3947D]'>Servicio</div>
                <div className='mt-1 text-xl font-bold text-[#17191D]' style={{ fontFamily: 'var(--font-display)' }}>
                  Compra con confianza
                </div>
              </div>
              <div className='divide-y divide-[#EEE9E1]'>
                {[
                  { icon: ShieldCheck, title: 'Control de calidad', body: 'Revisamos cada unidad antes del despacho.' },
                  { icon: PackageCheck, title: 'Empaque cuidado', body: 'Preparamos tu lámpara para un traslado seguro.' },
                  { icon: Truck, title: 'Envíos nacionales', body: 'Despachos disponibles dentro de Colombia.' },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className='flex gap-4 px-6 py-5'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17191D] text-[#F6D79D]'>
                      <Icon className='h-4.5 w-4.5' />
                    </div>
                    <div>
                      <div className='text-sm font-bold text-[#17191D]'>{title}</div>
                      <div className='mt-1 text-sm leading-6 text-[#726E67]'>{body}</div>
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
  )
}
