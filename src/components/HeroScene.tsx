import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  src: string
  alt: string
  title: string
  label: string
}

const PRODUCTS: {
  id: number
  title: string
  subtitle: string
  description: string
  price: number
  images: string[]
  category: string
  featured?: boolean
  popular?: boolean
  minimum?: number
}[] = await fetch('/products.json').then(res => res.json())
const BASE_SLIDES: Slide[] = PRODUCTS.map(product => ({
  src: product.images[0],
  alt: product.title,
  title: product.title,
  label: product.category
}))

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

export default function HeroScene () {
  const [slides] = useState<Slide[]>(() => shuffle(BASE_SLIDES))
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const goTo = (index: number, dir = 1) => {
    const next = (index + slides.length) % slides.length
    setDirection(dir)
    setActive(next)
  }

  useEffect(() => {
    if (paused || slides.length <= 1) return

    const timer = window.setInterval(() => {
      setDirection(1)
      setActive(current => (current + 1) % slides.length)
    }, 2000)

    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  const slide = slides[active]

  return (
    <div
      className='relative h-full min-h-[430px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#151412] shadow-[0_30px_80px_rgba(0,0,0,0.35)]'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(255,197,103,0.18),transparent_42%)]' />

      <AnimatePresence initial={false} custom={direction} mode='sync'>
        <motion.div
          key={slide.src}
          custom={direction}
          className='absolute inset-0'
          initial={{ opacity: 0, x: direction > 0 ? 70 : -70, scale: 1.025 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction > 0 ? -70 : 70, scale: 1.01 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className='h-full w-full object-cover'
            draggable={false}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20' />
        </motion.div>
      </AnimatePresence>

      <div className='absolute left-5 top-5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F6D79D] backdrop-blur-md'>
        {slide.label}
      </div>

      <div className='absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4'>
        <div className='min-w-0'>
          <div className='text-2xl font-black tracking-tight text-white sm:text-3xl'>
            {slide.title}
          </div>
          <div className='mt-1 text-sm text-white/65'>
            Lámparas comerciales de alta calidad
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <button
            type='button'
            onClick={() => goTo(active - 1, -1)}
            aria-label='Imagen anterior'
            className='flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D7A451]'
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
          <button
            type='button'
            onClick={() => goTo(active + 1, 1)}
            aria-label='Siguiente imagen'
            className='flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D7A451]'
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </div>
      </div>

      <div className='absolute bottom-5 left-1/2 hidden -translate-x-1/2 gap-1.5 sm:flex'>
        {slides.slice(0, Math.min(slides.length, 10)).map((item, index) => (
          <button
            key={item.src}
            type='button'
            onClick={() => goTo(index, index >= active ? 1 : -1)}
            aria-label={`Ver imagen ${index + 1}`}
            aria-current={index === active}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active ? 'w-8 bg-[#F6D79D]' : 'w-1.5 bg-white/45 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      <div className='absolute right-5 top-5 hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55 backdrop-blur-md sm:flex'>
        {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  )
}
