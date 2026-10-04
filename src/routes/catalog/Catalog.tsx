import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

const PRODUCTS: Product[] = await fetch('/products.json').then(res => {
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
        reject(
          new Error(
            'El checkout de Wompi tardó demasiado en cargar.'
          )
        )
      }, 15000)

      existingScript.addEventListener('load', () => {
        window.clearTimeout(timeout)
        resolve()
      })

      existingScript.addEventListener('error', () => {
        window.clearTimeout(timeout)
        reject(
          new Error(
            'No fue posible cargar el checkout de Wompi.'
          )
        )
      })

      if (window.WidgetCheckout) {
        window.clearTimeout(timeout)
        resolve()
      }
    })

    if (!window.WidgetCheckout) {
      throw new Error(
        'Wompi no quedó disponible después de cargar el script.'
      )
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
      reject(
        new Error(
          'No fue posible cargar el checkout de Wompi.'
        )
      )
    }

    document.head.appendChild(script)
  })

  if (!window.WidgetCheckout) {
    throw new Error(
      'Wompi no quedó disponible después de cargar el script.'
    )
  }
}

export default function Catalog() {
  const [products] = useState<Product[]>(() => shuffle(PRODUCTS))
  const [search, setSearch] = useState('')

  const [category, setCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search)

    const categories = [
      'Todas',
      ...Array.from(
        new Set(PRODUCTS.map(product => product.category))
      )
    ]

    return findCategoryFromTab(params.get('tab'), categories)
  })

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null)

  const categories = useMemo(
    () => [
      'Todas',
      ...Array.from(
        new Set(products.map(product => product.category))
      )
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
      ...products.filter(
        product => product.id !== referencedProduct.id
      )
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
        category === 'Todas' ||
        product.category === category

      return matchesSearch && matchesCategory
    })
  }, [category, orderedProducts, search])

  return (
    <div className='min-h-screen bg-[#F4F1EA] text-[#171512]'>
      <section className='relative overflow-hidden border-b border-[#D9D1C2] bg-[#171512]'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(circle at 78% 35%, rgba(215,164,81,.22), transparent 32%), radial-gradient(circle at 10% 85%, rgba(255,255,255,.07), transparent 25%)'
          }}
        />

        <div className='relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28'>
          <div className='max-w-4xl'>
            <div className='mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F6D79D]'>
              Colección de iluminación
            </div>

            <h1
              className='max-w-4xl text-5xl font-black tracking-[-0.045em] text-[#F7F5EF] sm:text-6xl md:text-7xl lg:text-[6rem]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Lámparas que hacen
              <span className='block text-[#D7A451]'>
                que el espacio hable.
              </span>
            </h1>

            <p className='mt-7 max-w-2xl text-lg leading-8 text-[#CBC7BF]'>
              Descubre nuestra colección de lámparas comerciales de alta
              calidad, fabricadas bajo pedido para convertir la
              iluminación en parte del diseño.
            </p>
          </div>

          <div className='mt-12 flex flex-col gap-4 lg:flex-row lg:items-center'>
            <div className='relative w-full max-w-2xl'>
              <Search className='absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8F8A80]' />

              <input
                type='search'
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder='Buscar una lámpara...'
                className='h-14 w-full rounded-2xl border border-white/10 bg-white/[0.08] pl-14 pr-5 text-base text-white outline-none transition placeholder:text-[#858078] focus:border-[#D7A451]/70 focus:bg-white/[0.11]'
              />
            </div>
          </div>

          <div className='mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {categories.map(item => (
              <button
                key={item}
                type='button'
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  item === category
                    ? 'border-[#D7A451] bg-[#D7A451] text-[#171512]'
                    : 'border-white/15 bg-white/[0.05] text-[#D2CEC5] hover:bg-white/[0.1]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className='mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20'>
        <div className='mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <div className='text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8243]'>
              Nuestra selección
            </div>

            <h2
              className='mt-2 text-4xl font-black tracking-tight text-[#171512] sm:text-5xl'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Encuentra tu lámpara
            </h2>
          </div>

          <div className='text-sm text-[#716C63]'>
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1
              ? 'modelo'
              : 'modelos'}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className='rounded-[2rem] border border-[#D9D1C2] bg-white p-14 text-center'>
            <Search className='mx-auto h-8 w-8 text-[#AE8243]' />

            <h3
              className='mt-5 text-2xl font-black'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No encontramos esa lámpara
            </h3>

            <p className='mx-auto mt-3 max-w-md text-[#706A61]'>
              Prueba con otro nombre o elimina el filtro para explorar
              toda la colección.
            </p>

            <button
              type='button'
              onClick={() => {
                setSearch('')
                setCategory('Todas')
              }}
              className='mt-6 rounded-full bg-[#171512] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#D7A451] hover:text-[#171512]'
            >
              Ver toda la colección
            </button>
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
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      className='group overflow-hidden rounded-[1.6rem] border border-[#D9D1C2] bg-white text-left transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(34,29,20,0.13)]'
    >
      <div className='relative aspect-[4/4.4] overflow-hidden bg-[#EDE8DF]'>
        <img
          src={product.images[0]}
          alt={product.title}
          className='h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]'
          loading='lazy'
        />

        <div className='absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent' />

        <div className='absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md'>
          {product.category}
        </div>

        <div className='absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3 text-white'>
          <div>
            <div className='text-2xl font-black tracking-tight'>
              {product.title}
            </div>

            <div className='mt-1 text-xs text-white/75'>
              {product.subtitle}
            </div>
          </div>

          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#171512] transition group-hover:bg-[#D7A451]'>
            <ArrowRight className='h-4 w-4' />
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between gap-4 px-5 py-4'>
        <span className='text-sm font-medium text-[#6B665D]'>
          Calidad de fabricación premium
        </span>

        <span className='shrink-0 text-sm font-bold text-[#171512]'>
          {formatPrice(product.price)}
        </span>
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

  useEffect(() => {
    setCurrentImage(0)
    setCheckoutOpen(false)

    if (!product) return

    const previousOverflow = document.body.style.overflow

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

  if (!product) return null

  const images = product.images

  const nextImage = () => {
    setCurrentImage(index => (index + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImage(
      index => (index - 1 + images.length) % images.length
    )
  }

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6'>
        <motion.button
          type='button'
          aria-label='Cerrar producto'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='absolute inset-0 h-full w-full cursor-default bg-black/65 backdrop-blur-md'
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1]
          }}
          className='relative mx-auto mt-4 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#F8F5EF] shadow-[0_40px_100px_rgba(0,0,0,0.35)] sm:mt-10'
        >
          <button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            className='absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55'
          >
            <X className='h-5 w-5' />
          </button>

          <div className='grid lg:grid-cols-[1.05fr_0.95fr]'>
            <div className='border-b border-[#DDD5C8] bg-[#EDE8DF] p-5 sm:p-8 lg:border-b-0 lg:border-r'>
              <div className='relative aspect-square overflow-hidden rounded-[1.5rem] bg-[#E2DCD1]'>
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={images[currentImage]}
                    src={images[currentImage]}
                    alt={`${product.title} - Vista ${
                      currentImage + 1
                    }`}
                    initial={{ opacity: 0, scale: 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.3 }}
                    className='h-full w-full object-cover'
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      type='button'
                      onClick={previousImage}
                      aria-label='Imagen anterior'
                      className='absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65'
                    >
                      <ChevronLeft className='h-5 w-5' />
                    </button>

                    <button
                      type='button'
                      onClick={nextImage}
                      aria-label='Siguiente imagen'
                      className='absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65'
                    >
                      <ChevronRight className='h-5 w-5' />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className='mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type='button'
                      onClick={() => setCurrentImage(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        currentImage === index
                          ? 'border-[#AE8243]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} miniatura ${
                          index + 1
                        }`}
                        className='h-full w-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className='flex flex-col p-6 sm:p-9 lg:p-12'>
              <div className='text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8243]'>
                {product.category}
              </div>

              <h2
                className='mt-3 text-4xl font-black tracking-[-0.035em] text-[#171512] sm:text-5xl'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {product.title}
              </h2>

              <p className='mt-3 text-base font-medium text-[#716C63]'>
                {product.subtitle}
              </p>

              <p className='mt-7 max-w-xl text-base leading-7 text-[#625D55]'>
                {product.description}
              </p>

              <div className='mt-8 grid grid-cols-2 gap-3'>
                {[
                  'Fabricación bajo pedido',
                  'Control de calidad',
                  'Diseño premium',
                  'Envíos en Colombia'
                ].map(item => (
                  <div
                    key={item}
                    className='rounded-2xl border border-[#DDD5C8] bg-white px-4 py-3 text-sm font-semibold text-[#433F38]'
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className='mt-auto pt-10'>
                <div className='flex items-end justify-between gap-4 border-t border-[#DDD5C8] pt-6'>
                  <div>
                    <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C857B]'>
                      Precio
                    </div>

                    <div
                      className='mt-1 text-4xl font-black tracking-tight text-[#171512]'
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={() => setCheckoutOpen(true)}
                    disabled={!product.price || product.price <= 0}
                    className='inline-flex h-14 items-center gap-2.5 rounded-full bg-[#171512] px-6 text-sm font-bold text-white transition hover:bg-[#D7A451] hover:text-[#171512] disabled:cursor-not-allowed disabled:bg-[#B8B2A8]'
                  >
                    <ShoppingBag className='h-4 w-4' />
                    Pedir y pagar
                  </button>
                </div>

                <div className='mt-4 flex items-center gap-2 text-xs text-[#7B756C]'>
                  <span className='h-2 w-2 rounded-full bg-[#3D8A5A]' />
                  Pago seguro mediante Wompi
                </div>

                {!product.price && (
                  <p className='mt-2 text-xs text-[#9A4B3F]'>
                    Agrega el precio real de este modelo en PRODUCTS para
                    habilitar el checkout.
                  </p>
                )}

                <AnimatePresence>
                  {checkoutOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='overflow-hidden'
                    >
                      <WompiCheckout
                        product={product}
                        onCancel={() => setCheckoutOpen(false)}
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
  onCancel
}: {
  product: Product
  onCancel: () => void
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

  const update = (
    field: keyof CheckoutData,
    value: string
  ) => {
    setData(current => ({
      ...current,
      [field]: value
    }))
  }

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setError('')

    if (!product.price || product.price <= 0) {
      setError(
        'Este producto todavía no tiene un precio configurado.'
      )
      return
    }

    const endpoint =
      import.meta.env.VITE_WOMPI_CHECKOUT_API

    if (!endpoint) {
      setError(
        'Falta configurar VITE_WOMPI_CHECKOUT_API.'
      )
      return
    }

    setLoading(true)

    try {
      /*
       * IMPORTANT:
       * Do not send the frontend price to the backend as a trusted
       * payment amount.
       *
       * The Lambda receives only productId + quantity + customer.
       * It then loads products.json from S3/CloudFront and determines
       * the authoritative price.
       */
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        throw new Error(
          'El backend devolvió una respuesta inválida.'
        )
      }

      if (!response.ok) {
        throw new Error(
          (result as any)?.message ||
            'No fue posible preparar el checkout.'
        )
      }

      if (!result) {
        throw new Error(
          'No se recibió respuesta del backend.'
        )
      }

      const checkout = result

      if (
        !checkout.publicKey ||
        !checkout.reference ||
        !checkout.signature ||
        !checkout.amountInCents ||
        !checkout.currency
      ) {
        throw new Error(
          'La respuesta del backend de Wompi está incompleta.'
        )
      }

      /*
       * Load Wompi only when the customer is actually starting
       * a payment. This avoids putting unnecessary payment
       * initialization in the initial page load.
       */
      await loadWompiWidget()

      if (!window.WidgetCheckout) {
        throw new Error(
          'No fue posible cargar el checkout de Wompi.'
        )
      }

      /*
       * IMPORTANT:
       * amountInCents comes from the backend.
       * We do NOT calculate it from product.price here.
       */
      const widget = new window.WidgetCheckout({
        currency: checkout.currency,

        amountInCents: checkout.amountInCents,

        reference: checkout.reference,

        publicKey: checkout.publicKey,

        signature: {
          integrity: checkout.signature
        },

        redirectUrl:
          checkout.redirectUrl ||
          `${window.location.origin}/pagos/respuesta`,

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

      widget.open(({ transaction }) => {
        /*
         * The transaction callback is useful for UX, but DO NOT
         * use it as authoritative proof that the payment is approved.
         *
         * The backend webhook should verify transaction.updated
         * and mark the order as PAID only after Wompi confirms it.
         */
        console.log('Wompi transaction:', transaction)

        const transactionId = transaction?.id

        onCancel()

        setLoading(false)

        if (transactionId) {
          window.location.href =
            `${window.location.origin}/pagos/respuesta?id=${encodeURIComponent(
              transactionId
            )}&reference=${encodeURIComponent(
              checkout.reference
            )}`
        } else {
          window.location.href =
            `${window.location.origin}/pagos/respuesta`
        }
      })
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
      className='mt-6 rounded-[1.5rem] border border-[#D9D1C2] bg-white p-5 sm:p-6'
    >
      <div className='mb-5'>
        <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#AE8243]'>
          Datos de pedido
        </div>

        <h3
          className='mt-2 text-2xl font-black text-[#171512]'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Preparar compra segura
        </h3>

        <p className='mt-2 text-sm leading-6 text-[#716C63]'>
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

      <div className='mt-4 rounded-2xl border border-[#DDD5C8] bg-[#FBF9F5] px-4 py-3'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <div className='text-xs font-semibold text-[#716C63]'>
              Producto
            </div>

            <div className='mt-1 text-sm font-bold text-[#171512]'>
              {product.title}
            </div>
          </div>

          <div className='text-sm font-black text-[#171512]'>
            {formatPrice(product.price)}
          </div>
        </div>
      </div>

      {error && (
        <div className='mt-4 rounded-xl border border-[#E6B5AE] bg-[#FFF5F2] px-4 py-3 text-sm text-[#8B443A]'>
          {error}
        </div>
      )}

      <div className='mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={onCancel}
          disabled={loading}
          className='h-12 rounded-full border border-[#D9D1C2] px-5 text-sm font-semibold text-[#4D4942] transition hover:bg-[#F4F1EA] disabled:cursor-not-allowed disabled:opacity-60'
        >
          Cancelar
        </button>

        <button
          type='submit'
          disabled={loading}
          className='inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#171512] px-6 text-sm font-bold text-white transition hover:bg-[#D7A451] hover:text-[#171512] disabled:cursor-wait disabled:opacity-60'
        >
          <ShoppingBag className='h-4 w-4' />

          {loading
            ? 'Preparando pago...'
            : 'Continuar con Wompi'}
        </button>
      </div>

      <div className='mt-4 flex items-center gap-2 text-xs text-[#7B756C]'>
        <span className='h-2 w-2 rounded-full bg-[#3D8A5A]' />
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
      <span className='mb-1.5 block text-xs font-semibold text-[#625D55]'>
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
        className='h-12 w-full rounded-xl border border-[#D9D1C2] bg-[#FBF9F5] px-4 text-sm text-[#171512] outline-none transition focus:border-[#AE8243] focus:ring-2 focus:ring-[#AE8243]/10'
      />
    </label>
  )
}