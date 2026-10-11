import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react'
import { AnimatePresence, MotionConfig, motion, type Transition } from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  X
} from 'lucide-react'

type Product = {
  id: number
  title: string
  subtitle: string
  description: string
  images: string[]
  category: string
  price?: number
  featured?: boolean
  popular?: boolean
}

type CheckoutData = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  region: string
}

type WompiCheckoutResponse = {
  publicKey: string
  reference: string
  signature: string
  amountInCents: number
  currency: 'COP'
  redirectUrl?: string
  product: {
    id: number
    title: string
    quantity: number
    unitPrice: number
  }
}

type WompiTransaction = {
  id?: string
  status?: string
  reference?: string
  amountInCents?: number
  currency?: string
  [key: string]: unknown
}

type WompiWidgetConfig = {
  currency: 'COP'
  amountInCents: number
  reference: string
  publicKey: string
  signature: {
    integrity: string
  }
  redirectUrl?: string
  customerData?: {
    email?: string
    fullName?: string
    phoneNumber?: string
    phoneNumberPrefix?: string
  }
  shippingAddress?: {
    addressLine1?: string
    city?: string
    phoneNumber?: string
    region?: string
    country?: string
  }
}

type WompiWidget = {
  open: (
    callback: (result: { transaction: WompiTransaction }) => void
  ) => void
}

declare global {
  interface Window {
    WidgetCheckout?: new (
      config: WompiWidgetConfig
    ) => WompiWidget
  }
}

const PRODUCT_CATALOG_URL =
  import.meta.env.VITE_PRODUCT_CATALOG_URL ||
  'https://d12ytbe88q1m0g.cloudfront.net/products.json'

const ASSET_CDN_URL =
  import.meta.env.VITE_ASSET_CDN_URL ||
  'https://d12ytbe88q1m0g.cloudfront.net'

const resolveImageUrl = (image: string) => {
  if (/^https?:\/\//i.test(image)) {
    return image
  }
  return `${ASSET_CDN_URL}/${image.replace(/^\/+/, '')}`
}

const PRODUCTS: Product[] = await fetch(PRODUCT_CATALOG_URL, {
  cache: 'no-store'
}).then(res => {
  if (!res.ok) {
    throw new Error('No fue posible cargar el catálogo de productos.')
  }
  return res.json()
})

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const formatPrice = (price?: number) => {
  if (!price || price <= 0) return 'Precio pendiente'
  return `$${price.toLocaleString('es-CO')}`
}

const normalizeParam = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const findProductByRef = (ref: string | null) => {
  if (!ref) return null

  const rawRef = ref.trim()
  const normalizedRef = normalizeParam(rawRef)

  return (
    PRODUCTS.find(product => {
      const idMatch = String(product.id) === rawRef
      if (idMatch) return true

      const titleSlug = normalizeParam(product.title)
      const titleWithLampSlug = normalizeParam(`lampara ${product.title}`)

      return (
        normalizedRef === titleSlug ||
        normalizedRef === titleWithLampSlug
      )
    }) ?? null
  )
}

const findCategoryFromTab = (
  tab: string | null,
  categories: string[]
) => {
  if (!tab) return 'Todas'
  const normalizedTab = normalizeParam(tab)
  return (
    categories.find(
      category => normalizeParam(category) === normalizedTab
    ) ?? 'Todas'
  )
}

const loadWompiWidget = async () => {
  if (window.WidgetCheckout) {
    return
  }

  const existingScript = document.querySelector(
    'script[data-wompi-widget="true"]'
  )

  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error('El checkout de Wompi tardó demasiado en cargar.'))
      }, 15000)

      existingScript.addEventListener('load', () => {
        window.clearTimeout(timeout)
        resolve()
      })

      existingScript.addEventListener('error', () => {
        window.clearTimeout(timeout)
        reject(new Error('No fue posible cargar el checkout de Wompi.'))
      })

      if (window.WidgetCheckout) {
        window.clearTimeout(timeout)
        resolve()
      }
    })

    if (!window.WidgetCheckout) {
      throw new Error('Wompi no quedó disponible después de cargar el script.')
    }
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    script.dataset.wompiWidget = 'true'
    script.onload = () => resolve()
    script.onerror = () => {
      reject(new Error('No fue posible cargar el checkout de Wompi.'))
    }
    document.head.appendChild(script)
  })

  if (!window.WidgetCheckout) {
    throw new Error('Wompi no quedó disponible después de cargar el script.')
  }
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/*  ink       #1D1D1F  primary text / primary button                          */
/*  body      #424245  long-form text                                         */
/*  muted     #6E6E73  secondary text                                         */
/*  surface   #F5F5F7  grouped background                                     */
/*  accent-tx #96600F  brand text (AA on white and on surface)                */
/* -------------------------------------------------------------------------- */

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif`

/* Springs are critically damped (no bounce): nothing here is thrown or flicked,
   so nothing overshoots. They retarget from the live value, so every motion can
   be interrupted without a jump. */
const PRESS_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.3 }

const SHEET_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.45 }

/* Press feedback begins on pointer-down and is reversible mid-press. */
const PRESS = {
  whileTap: { scale: 0.97 },
  transition: PRESS_SPRING
} as const

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96600F]'

/* Translucent materials fall back to solid when transparency is reduced. */
const GLASS_LIGHT =
  'bg-white/70 backdrop-blur-md [@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none'

const SCRIM =
  'bg-black/50 backdrop-blur-xl [@media(prefers-reduced-transparency:reduce)]:bg-black/75 [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none'

const BTN_BASE = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`

const BTN_PRIMARY = 'bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'


export default function Catalog() {
  const [products] = useState<Product[]>(() => shuffle(PRODUCTS))
  const [search, setSearch] = useState('')

  const [category, setCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const categories = [
      'Todas',
      ...Array.from(new Set(PRODUCTS.map(product => product.category)))
    ]
    return findCategoryFromTab(params.get('tab'), categories)
  })

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const categories = useMemo(
    () => [
      'Todas',
      ...Array.from(new Set(products.map(product => product.category)))
    ],
    [products]
  )

  const referencedProduct = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return findProductByRef(params.get('ref'))
  }, [])

  const orderedProducts = useMemo(() => {
    if (!referencedProduct) return products
    return [
      referencedProduct,
      ...products.filter(product => product.id !== referencedProduct.id)
    ]
  }, [products, referencedProduct])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orderedProducts.filter(product => {
      const matchesSearch =
        query.length === 0 ||
        product.title.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)

      const matchesCategory =
        category === 'Todas' || product.category === category

      return matchesSearch && matchesCategory
    })
  }, [category, orderedProducts, search])

  return (
    // Reduced motion: transforms are dropped, opacity fades are kept.
    <MotionConfig reducedMotion='user'>
      <div
        className='min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased [font-optical-sizing:auto]'
        style={{ fontFamily: FONT_STACK }}
      >
        {/* ... Headers de la vista ... */}
        <section className='relative overflow-hidden bg-white'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'radial-gradient(circle at 78% 35%, rgba(255, 190, 83, 0.16), transparent 34%)'
            }}
          />

          <div className='relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28'>
            <div className='max-w-4xl'>
              <div className='mb-6 inline-flex items-center rounded-full bg-[#F5F5F7] px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] text-[#96600F]'>
                Colección de iluminación
              </div>

              <h1 className='max-w-4xl text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[#1D1D1F]'>
                Lámparas que hacen
                <span className='block text-[#96600F]'>
                  que el espacio hable.
                </span>
              </h1>

              <p className='mt-6 max-w-2xl text-[1.0625rem] leading-[1.47] text-[#6E6E73] sm:text-[1.3125rem] sm:leading-[1.38]'>
                Descubre nuestra colección de lámparas comerciales de alta
                calidad, fabricadas bajo pedido para convertir la
                iluminación en parte del diseño.
              </p>
            </div>

            <div className='mt-12 flex flex-col gap-4 lg:flex-row lg:items-center'>
              <div className='relative w-full max-w-2xl'>
                <Search
                  aria-hidden='true'
                  className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E6E73]'
                />

                <input
                  type='search'
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder='Buscar una lámpara...'
                  className='h-12 w-full rounded-xl bg-black/[0.06] pl-12 pr-5 text-base tracking-[-0.005em] text-[#1D1D1F] outline-none transition-colors duration-200 placeholder:text-[#6E6E73] focus:bg-white focus:ring-2 focus:ring-[#96600F]'
                />
              </div>
            </div>

            <div className='-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {categories.map(item => (
                <motion.button
                  key={item}
                  type='button'
                  onClick={() => setCategory(item)}
                  {...PRESS}
                  className={`min-h-11 shrink-0 rounded-full px-5 text-[0.9375rem] font-medium tracking-[-0.005em] transition-colors duration-200 ${FOCUS} ${
                    item === category
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10'
                  }`}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <main className='mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20'>
          <div className='mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <div className='text-[1.0625rem] font-semibold leading-snug text-[#96600F]'>
                Nuestra selección
              </div>

              <h2 className='mt-2 text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[#1D1D1F]'>
                Encuentra tu lámpara
              </h2>
            </div>

            <div className='text-[0.9375rem] text-[#6E6E73]'>
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'modelo' : 'modelos'}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className='rounded-[28px] bg-white p-14 text-center'>
              <Search
                aria-hidden='true'
                className='mx-auto h-8 w-8 text-[#96600F]'
              />

              <h3 className='mt-5 text-2xl font-semibold leading-[1.15] tracking-[-0.015em] text-[#1D1D1F]'>
                No encontramos esa lámpara
              </h3>

              <p className='mx-auto mt-3 max-w-md text-[1.0625rem] leading-[1.47] text-[#6E6E73]'>
                Prueba con otro nombre o elimina el filtro para explorar
                toda la colección.
              </p>

              <motion.button
                type='button'
                onClick={() => {
                  setSearch('')
                  setCategory('Todas')
                }}
                {...PRESS}
                className={`mt-6 min-h-12 px-6 text-[1.0625rem] ${BTN_BASE} ${BTN_PRIMARY}`}
              >
                Ver toda la colección
              </motion.button>
            </div>
          ) : (
            <motion.div
              layout
              className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
            >
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </motion.div>
          )}
        </main>

        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </MotionConfig>
  )
}

function ProductCard({
  product,
  onClick
}: {
  product: Product
  onClick: () => void
}) {
  return (
    <motion.button
      type='button'
      layout
      onClick={onClick}
      {...PRESS}
      className={`group overflow-hidden rounded-[28px] bg-white p-3 text-left ${FOCUS}`}
    >
      {/* Concentric radii: 28px card, 12px inset, 16px image well. */}
      <div className='relative aspect-[4/4.4] overflow-hidden rounded-2xl bg-[#F5F5F7]'>
        <img
          src={resolveImageUrl(product.images[0])}
          alt={product.title}
          className='h-full w-full object-contain'
          loading='lazy'
        />

        <div
          className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium tracking-[0.01em] text-[#1D1D1F] ${GLASS_LIGHT}`}
        >
          {product.category}
        </div>
      </div>

      <div className='flex items-end justify-between gap-3 px-3 pb-3 pt-5'>
        <div>
          <div className='text-[1.375rem] font-semibold leading-[1.15] tracking-[-0.015em] text-[#1D1D1F]'>
            {product.title}
          </div>
          <div className='mt-1 text-[0.9375rem] leading-snug text-[#6E6E73]'>
            {product.subtitle}
          </div>

          <span className='mt-4 block text-[0.9375rem] font-semibold text-[#1D1D1F]'>
            {formatPrice(product.price)}
          </span>
        </div>

        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1D1D1F] transition-colors duration-200 group-hover:bg-[#1D1D1F] group-hover:text-white'>
          <ArrowRight className='h-4 w-4' aria-hidden='true' />
        </div>
      </div>
    </motion.button>
  )
}

function ProductModal({
  product,
  onClose
}: {
  product: Product | null
  onClose: () => void
}) {
  const [currentImage, setCurrentImage] = useState(0)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  
  const checkoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentImage(0)
    setCheckoutOpen(false)

    if (!product) return

    const previousOverflow = document.body.style.overflow
    // Bloqueamos el scroll del body solo mientras el ProductModal esté montado.
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [product])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    if (product) {
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, product])

  useEffect(() => {
    if (checkoutOpen && checkoutRef.current) {
      const timer = setTimeout(() => {
        checkoutRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [checkoutOpen])

  if (!product) return null

  const images = product.images

  const nextImage = () => {
    setCurrentImage(index => (index + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImage(index => (index - 1 + images.length) % images.length)
  }

  const buyDisabled = !product.price || product.price <= 0 || checkoutOpen

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-[100] overflow-y-auto px-4 sm:px-6'>
        <motion.button
          type='button'
          aria-label='Cerrar producto'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={onClose}
          className={`fixed inset-0 h-full w-full cursor-default ${SCRIM}`}
        />

        {/* Enters and exits along the same path (up from / back down to y: 24). */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{
            y: SHEET_SPRING,
            scale: SHEET_SPRING,
            opacity: { duration: 0.25, ease: 'easeOut' }
          }}
          className='relative mx-auto my-12 w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]'
        >
          <motion.button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            {...PRESS}
            className={`absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full text-[#1D1D1F] transition-colors duration-200 hover:bg-white ${GLASS_LIGHT} ${FOCUS}`}
          >
            <X className='h-5 w-5' aria-hidden='true' />
          </motion.button>

          <div className='grid lg:grid-cols-[1.05fr_0.95fr]'>
            {/* ... Galería de imágenes ... */}
            <div className='bg-[#F5F5F7] p-5 sm:p-8'>
              <div className='group relative aspect-square overflow-hidden rounded-3xl bg-white'>
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={images[currentImage]}
                    src={resolveImageUrl(images[currentImage])}
                    alt={`${product.title} Vista ${currentImage + 1}`}
                    initial={{ opacity: 0, scale: 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className='h-full w-full object-contain'
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      type='button'
                      onClick={previousImage}
                      aria-label='Imagen anterior'
                      className={`absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#1D1D1F] opacity-0 transition duration-200 hover:bg-white active:scale-95 group-hover:opacity-100 focus-visible:opacity-100 ${GLASS_LIGHT} ${FOCUS}`}
                    >
                      <ChevronLeft className='h-5 w-5' aria-hidden='true' />
                    </button>

                    <button
                      type='button'
                      onClick={nextImage}
                      aria-label='Siguiente imagen'
                      className={`absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#1D1D1F] opacity-0 transition duration-200 hover:bg-white active:scale-95 group-hover:opacity-100 focus-visible:opacity-100 ${GLASS_LIGHT} ${FOCUS}`}
                    >
                      <ChevronRight className='h-5 w-5' aria-hidden='true' />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className='mt-4 flex flex-wrap gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                  {images.map((image, index) => (
                    <motion.button
                      key={image}
                      type='button'
                      onClick={() => setCurrentImage(index)}
                      {...PRESS}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white transition-opacity duration-200 ${FOCUS} ${
                        currentImage === index
                          ? 'ring-2 ring-[#96600F] ring-offset-2 ring-offset-[#F5F5F7]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(image)}
                        alt={`${product.title} miniatura ${index + 1}`}
                        className='h-full w-full object-contain'
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className='flex flex-col p-6 sm:p-9 lg:p-12'>
              <div className='text-[1.0625rem] font-semibold leading-snug text-[#96600F]'>
                {product.category}
              </div>

              <h2 className='mt-3 text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#1D1D1F]'>
                {product.title}
              </h2>

              <p className='mt-3 text-xl leading-[1.3] tracking-[-0.01em] text-[#6E6E73]'>
                {product.subtitle}
              </p>

              <p className='mt-7 max-w-xl text-[1.0625rem] leading-[1.5] text-[#424245]'>
                {product.description}
              </p>

              <div className='mt-8 grid grid-cols-2 gap-3'>
                {[
                  'Fabricación bajo pedido',
                  'Material: Plástico',
                  'Diseño premium',
                  'Envíos en Colombia'
                ].map(item => (
                  <div
                    key={item}
                    className='rounded-2xl bg-[#F5F5F7] px-4 py-3.5 text-[0.9375rem] font-medium leading-snug text-[#1D1D1F]'
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className='mt-auto pt-10'>
                <div className='flex items-end justify-between gap-4'>
                  <div>
                    <div className='text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]'>
                      Precio
                    </div>
                    <div className='mt-1 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-[#1D1D1F]'>
                      {formatPrice(product.price)} COP
                    </div>
                  </div>

                  <motion.button
                    type='button'
                    onClick={() => setCheckoutOpen(true)}
                    disabled={buyDisabled}
                    whileTap={buyDisabled ? undefined : PRESS.whileTap}
                    transition={PRESS_SPRING}
                    className={`min-h-12 px-6 text-[1.0625rem] ${BTN_BASE} ${BTN_PRIMARY}`}
                  >
                    <ShoppingBag className='h-4 w-4' aria-hidden='true' />
                    Pedir y pagar
                  </motion.button>
                </div>

                <div className='mt-4 flex items-center gap-2 text-[0.8125rem] tracking-[0.01em] text-[#6E6E73]'>
                  <span className='h-2 w-2 rounded-full bg-[#248A3D]' />
                  Pago seguro mediante Wompi
                </div>

                {!product.price && (
                  <p className='mt-2 text-[0.8125rem] text-[#D70015]'>
                    Agrega el precio real de este modelo en PRODUCTS para
                    habilitar el checkout.
                  </p>
                )}

                <AnimatePresence>
                  {checkoutOpen && (
                    <motion.div
                      ref={checkoutRef}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        height: SHEET_SPRING,
                        opacity: { duration: 0.25, ease: 'easeOut' }
                      }}
                      className='overflow-auto'
                    >
                      <WompiCheckout
                        product={product}
                        onCancel={() => setCheckoutOpen(false)}
                        onCloseModal={onClose}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function WompiCheckout({
  product,
  onCancel,
  onCloseModal
}: {
  product: Product
  onCancel: () => void
  onCloseModal: () => void
}) {
  const [data, setData] = useState<CheckoutData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof CheckoutData, value: string) => {
    setData(current => ({ ...current, [field]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!product.price || product.price <= 0) {
      setError('Este producto todavía no tiene un precio configurado.')
      return
    }

    const endpoint = import.meta.env.VITE_WOMPI_CHECKOUT_API

    if (!endpoint) {
      setError('Falta configurar VITE_WOMPI_CHECKOUT_API.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          customer: data
        })
      })

      let result: WompiCheckoutResponse | null = null

      try {
        result = await response.json()
      } catch {
        throw new Error('El backend devolvió una respuesta inválida.')
      }

      if (!response.ok) {
        throw new Error(
          (result as any)?.message || 'No fue posible preparar el checkout.'
        )
      }

      if (!result) {
        throw new Error('No se recibió respuesta del backend.')
      }

      const checkout = result

      if (
        !checkout.publicKey ||
        !checkout.reference ||
        !checkout.signature ||
        !checkout.amountInCents ||
        !checkout.currency
      ) {
        throw new Error('La respuesta del backend de Wompi está incompleta.')
      }

      await loadWompiWidget()

      if (!window.WidgetCheckout) {
        throw new Error('No fue posible cargar el checkout de Wompi.')
      }

      const widget = new window.WidgetCheckout({
        currency: checkout.currency,
        amountInCents: checkout.amountInCents,
        reference: checkout.reference,
        publicKey: checkout.publicKey,
        signature: { integrity: checkout.signature },
        redirectUrl:
          checkout.redirectUrl ||
          `${window.location.origin}/payment-successful`,
        customerData: {
          email: data.email,
          fullName: data.name,
          phoneNumber: data.phone,
          phoneNumberPrefix: '+57'
        },
        shippingAddress: {
          addressLine1: data.address,
          city: data.city,
          phoneNumber: data.phone,
          region: data.region,
          country: 'CO'
        }
      })

      // CERRAR EL MODAL DE REACT: Desmonta el modal, restaura el body overflow nativo, 
      // limpiando la pantalla completamente antes de abrir Wompi.
      onCloseModal()

      // Esperamos un instante minúsculo (150ms) para permitir a React limpiar el DOM, 
      // retirar las clases fijas del modal y ejecutar los cleanups del body.
      setTimeout(() => {
        widget.open(({ transaction }) => {
          console.log('Wompi transaction:', transaction)
          const params = new URLSearchParams()

          if (transaction?.id) {
            params.set('id', transaction.id)
          }

          params.set('reference', checkout.reference)

          window.location.href = `${window.location.origin}/payment-successful?${params.toString()}`
        })
      }, 150)

    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No fue posible iniciar el pago.'
      )
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className='mt-6 rounded-3xl bg-[#F5F5F7] p-5 sm:p-6'
    >
      <div className='mb-5'>
        <div className='text-[0.9375rem] font-semibold leading-snug text-[#96600F]'>
          Datos de pedido
        </div>

        <h3 className='mt-1 text-2xl font-semibold leading-[1.15] tracking-[-0.015em] text-[#1D1D1F]'>
          Preparar compra segura
        </h3>

        <p className='mt-2 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
          Tus datos se utilizan para preparar el pedido y enviarlos al
          proceso de pago seguro de Wompi.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <CheckoutInput
          label='Nombre completo'
          name='name'
          autoComplete='name'
          value={data.name}
          onChange={value => update('name', value)}
          required
        />
        <CheckoutInput
          label='Correo'
          name='email'
          type='email'
          autoComplete='email'
          value={data.email}
          onChange={value => update('email', value)}
          required
        />
        <CheckoutInput
          label='Teléfono'
          name='tel'
          type='tel'
          autoComplete='tel'
          value={data.phone}
          onChange={value => update('phone', value)}
          required
        />
        <CheckoutInput
          label='Ciudad'
          name='city'
          autoComplete='address-level2'
          value={data.city}
          onChange={value => update('city', value)}
          required
        />
        <CheckoutInput
          label='Departamento'
          name='region'
          autoComplete='address-level1'
          value={data.region}
          onChange={value => update('region', value)}
          required
        />
        <CheckoutInput
          label='Dirección'
          name='address'
          autoComplete='street-address'
          value={data.address}
          onChange={value => update('address', value)}
          required
        />
      </div>

      <div className='mt-4 rounded-2xl bg-white px-4 py-3.5'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <div className='text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]'>
              Producto
            </div>
            <div className='mt-1 text-[0.9375rem] font-semibold text-[#1D1D1F]'>
              {product.title}
            </div>
          </div>
          <div className='text-[0.9375rem] font-semibold text-[#1D1D1F]'>
            {formatPrice(product.price)} COP
          </div>
        </div>
      </div>

      {error && (
        <div
          role='alert'
          className='mt-4 rounded-xl bg-[#D70015]/10 px-4 py-3 text-[0.9375rem] leading-snug text-[#B00012]'
        >
          {error}
        </div>
      )}

      <div className='mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <motion.button
          type='button'
          onClick={onCancel}
          disabled={loading}
          whileTap={loading ? undefined : PRESS.whileTap}
          transition={PRESS_SPRING}
          className={`min-h-12 px-5 text-[1.0625rem] ${BTN_BASE} bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10`}
        >
          Cancelar
        </motion.button>

        <motion.button
          type='submit'
          disabled={loading}
          whileTap={loading ? undefined : PRESS.whileTap}
          transition={PRESS_SPRING}
          className={`min-h-12 px-6 text-[1.0625rem] disabled:cursor-wait ${BTN_BASE} ${BTN_PRIMARY}`}
        >
          <ShoppingBag className='h-4 w-4' aria-hidden='true' />
          {loading ? 'Preparando pago...' : 'Continuar con Wompi'}
        </motion.button>
      </div>

      <div className='mt-4 flex items-center gap-2 text-[0.8125rem] tracking-[0.01em] text-[#6E6E73]'>
        <span className='h-2 w-2 rounded-full bg-[#248A3D]' />
        Pago procesado de forma segura mediante Wompi
      </div>
    </form>
  )
}

function CheckoutInput({
  label,
  value,
  onChange,
  required,
  type = 'text',
  name,
  autoComplete
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  name: string
  autoComplete: string
}) {
  return (
    <label className='block'>
      <span className='mb-1.5 block text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]'>
        {label}
      </span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        className='h-12 w-full rounded-xl bg-white px-4 text-base tracking-[-0.005em] text-[#1D1D1F] outline-none transition-shadow duration-200 focus:ring-2 focus:ring-[#96600F]'
      />
    </label>
  )
}