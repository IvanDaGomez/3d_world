import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Upload,
  X
} from 'lucide-react'
import { MotionConfig, motion, type Transition } from 'framer-motion'

type Category =
  | 'Moderno'
  | 'Orgánico'
  | 'Minimalista'
  | 'Clásico'
  | 'Decorativo'
  | 'Temática'
  | 'Industrial'
  | 'Especial'

type ProductForm = {
  title: string
  subtitle: string
  description: string
  category: Category
  price: string
  featured: boolean
  popular: boolean
}

type SelectedImage = {
  id: string
  file: File
  preview: string
}

type UploadRequestResponse = {
  uploadId: string
  uploads: {
    key: string
    url: string
    filename: string
  }[]
}

type CreateProductResponse = {
  message?: string
  product?: {
    id: number
    title: string
    images: string[]
  }
  error?: string
}

const UPLOAD_API =
  import.meta.env.VITE_PRODUCT_UPLOAD_API ||
  import.meta.env.VITE_PRODUCT_API

const PRODUCT_API = import.meta.env.VITE_PRODUCT_API

const MAX_IMAGES = 10
const MAX_FILE_SIZE = 15 * 1024 * 1024

const CATEGORIES: Category[] = [
  'Moderno',
  'Orgánico',
  'Minimalista',
  'Clásico',
  'Decorativo',
  'Temática',
  'Industrial',
  'Especial'
]

const formatPrice = (value: string) => {
  if (!value) return 'Consultar'

  const price = Number(value)

  if (!Number.isFinite(price) || price <= 0) {
    return 'Consultar'
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price)
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/*  ink       #1D1D1F  primary text / primary button                          */
/*  muted     #6E6E73  secondary text                                         */
/*  surface   #F5F5F7  grouped background / field fill                        */
/*  accent-tx #96600F  brand text (AA on white and on surface)                */
/*  success   #248A3D  /  danger #D70015                                      */
/* -------------------------------------------------------------------------- */

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif`

/* Critically damped springs: nothing here carries momentum, so nothing
   overshoots. They retarget from the live value, so every motion can be
   interrupted without a jump. */
const PRESS_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.3 }

/* Press feedback begins on pointer-down and is reversible mid-press. */
const PRESS = {
  whileTap: { scale: 0.97 },
  transition: PRESS_SPRING
} as const

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96600F]'

/* Translucent material falls back to solid when transparency is reduced. */
const GLASS_LIGHT =
  'bg-white/70 backdrop-blur-md [@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none'

const BTN_BASE = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[1.0625rem] font-medium tracking-[-0.005em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`

const BTN_PRIMARY = 'bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'

/* 16px field text so iOS never zooms on focus. */
const INPUT_CLS =
  'w-full rounded-xl bg-[#F5F5F7] px-4 text-base tracking-[-0.005em] text-[#1D1D1F] outline-none transition-shadow duration-200 placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#96600F]'

const LABEL_CLS =
  'mb-2 block text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]'

const CARD_CLS = 'rounded-[28px] bg-white p-6 sm:p-8'

const EYEBROW_CLS =
  'text-[0.9375rem] font-semibold leading-snug text-[#96600F]'

const H2_CLS =
  'mt-1 text-2xl font-semibold leading-[1.15] tracking-[-0.015em] text-[#1D1D1F]'
export default function AdminProducts() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem('product_admin_key') || ''
  )

  const [form, setForm] = useState<ProductForm>({
    title: '',
    subtitle: '',
    description: '',
    category: 'Moderno',
    price: '',
    featured: false,
    popular: false
  })

  const [images, setImages] = useState<SelectedImage[]>([])
  const [activeImage, setActiveImage] = useState(0)

  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, [])

  const previewImage = images[activeImage]?.preview || null

  const formattedPrice = useMemo(
    () => formatPrice(form.price),
    [form.price]
  )

  const updateField = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) => {
    setForm(current => ({
      ...current,
      [field]: value
    }))
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    setError('')
    setMessage('')

    const remainingSlots = MAX_IMAGES - images.length

    if (files.length > remainingSlots) {
      setError(
        `Puedes agregar máximo ${MAX_IMAGES} imágenes por producto.`
      )
    }

    const accepted = files
      .slice(0, remainingSlots)
      .filter(file => {
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} no es una imagen válida.`)
          return false
        }

        if (file.size > MAX_FILE_SIZE) {
          setError(
            `${file.name} supera el límite de 15 MB.`
          )
          return false
        }

        return true
      })

    const newImages: SelectedImage[] = accepted.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }))

    setImages(current => [...current, ...newImages])

    if (images.length === 0 && newImages.length > 0) {
      setActiveImage(0)
    }

    event.target.value = ''
  }

  const removeImage = (id: string) => {
    setImages(current => {
      const index = current.findIndex(image => image.id === id)

      if (index === -1) {
        return current
      }

      URL.revokeObjectURL(current[index].preview)

      const next = current.filter(image => image.id !== id)

      if (!next.length) {
        setActiveImage(0)
      } else if (activeImage >= next.length) {
        setActiveImage(next.length - 1)
      }

      return next
    })
  }

  const moveImage = (
    index: number,
    direction: 'left' | 'right'
  ) => {
    setImages(current => {
      const next = [...current]

      const target =
        direction === 'left'
          ? index - 1
          : index + 1

      if (target < 0 || target >= next.length) {
        return current
      }

      ;[next[index], next[target]] = [
        next[target],
        next[index]
      ]

      if (activeImage === index) {
        setActiveImage(target)
      } else if (activeImage === target) {
        setActiveImage(index)
      }

      return next
    })
  }

  const validate = () => {
    if (!adminKey.trim()) {
      return 'Ingresa la clave administrativa.'
    }

    if (!form.title.trim()) {
      return 'El título es obligatorio.'
    }

    if (!form.subtitle.trim()) {
      return 'El subtítulo es obligatorio.'
    }

    if (!form.description.trim()) {
      return 'La descripción es obligatoria.'
    }

    if (!images.length) {
      return 'Selecciona al menos una imagen.'
    }

    if (form.price.trim()) {
      const price = Number(form.price)

      if (!Number.isFinite(price) || price <= 0) {
        return 'El precio no es válido.'
      }
    }

    return null
  }

  const requestUploadUrls = async () => {
    const response = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey.trim()
      },
      body: JSON.stringify({
        files: images.map(image => ({
          filename: image.file.name,
          contentType: image.file.type,
          size: image.file.size
        }))
      })
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        result?.message ||
          result?.error ||
          'No fue posible preparar la subida de imágenes.'
      )
    }

    if (
      !result?.uploadId ||
      !Array.isArray(result.uploads) ||
      result.uploads.length !== images.length
    ) {
      throw new Error(
        'El servidor devolvió una respuesta de subida inválida.'
      )
    }

    return result as UploadRequestResponse
  }

  const uploadDirectlyToS3 = async (
    uploadData: UploadRequestResponse
  ) => {
    const completedKeys: string[] = []

    for (let index = 0; index < images.length; index++) {
      const image = images[index]
      const upload = uploadData.uploads[index]

      const response = await fetch(upload.url, {
        method: 'PUT',
        headers: {
          'Content-Type': image.file.type
        },
        body: image.file
      })

      if (!response.ok) {
        throw new Error(
          `No fue posible subir "${image.file.name}" a S3.`
        )
      }

      completedKeys.push(upload.key)

      setUploadProgress(
        Math.round(((index + 1) / images.length) * 100)
      )
    }

    return completedKeys
  }

  const createProduct = async (
    imageKeys: string[],
    uploadId: string
  ) => {
    const response = await fetch(PRODUCT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey.trim()
      },
      body: JSON.stringify({
        uploadId,

        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),

        category: form.category,

        ...(form.price.trim()
          ? {
              price: Number(form.price)
            }
          : {}),

        featured: form.featured,
        popular: form.popular,

        images: imageKeys
      })
    })

    const result: CreateProductResponse =
      await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        result.message ||
          result.error ||
          'No fue posible crear el producto.'
      )
    }

    return result
  }

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setMessage('')
    setUploadProgress(0)

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    if (!UPLOAD_API) {
      setError(
        'Falta configurar VITE_PRODUCT_UPLOAD_API.'
      )
      return
    }

    if (!PRODUCT_API) {
      setError(
        'Falta configurar VITE_PRODUCT_API.'
      )
      return
    }

    setLoading(true)

    try {
      /*
       * STEP 1
       * Ask Lambda for presigned S3 URLs.
       */
      const uploadData =
        await requestUploadUrls()

      /*
       * STEP 2
       * Upload actual File objects directly from
       * the browser to S3.
       *
       * Lambda/API Gateway never receives the image
       * binary.
       */
      const imageKeys =
        await uploadDirectlyToS3(uploadData)

      /*
       * STEP 3
       * Tell the Product Lambda which S3 objects
       * belong to the new product.
       */
      const result = await createProduct(
        imageKeys,
        uploadData.uploadId
      )

      sessionStorage.setItem(
        'product_admin_key',
        adminKey.trim()
      )

      setMessage(
        result.product?.id
          ? `Producto #${result.product.id} creado correctamente.`
          : result.message ||
              'Producto creado correctamente.'
      )

      images.forEach(image => {
        URL.revokeObjectURL(image.preview)
      })

      setImages([])
      setActiveImage(0)
      setUploadProgress(0)

      setForm({
        title: '',
        subtitle: '',
        description: '',
        category: 'Moderno',
        price: '',
        featured: false,
        popular: false
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setLoading(false)
    }
  }

  const pickerDisabled = images.length >= MAX_IMAGES || loading

  return (
    // Reduced motion: transforms are dropped, opacity fades are kept.
    <MotionConfig reducedMotion='user'>
      <main
        className='min-h-screen bg-[#F5F5F7] px-5 py-10 text-[#1D1D1F] antialiased [font-optical-sizing:auto] sm:px-8 lg:px-12'
        style={{ fontFamily: FONT_STACK }}
      >
        <div className='mx-auto max-w-7xl'>
          {/* HEADER */}
          <div className='mb-10'>
            <div className={EYEBROW_CLS}>
              Vanguard · Administración
            </div>

            <h1 className='mt-2 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.028em]'>
              Nuevo producto
            </h1>

            <p className='mt-3 max-w-2xl text-[1.0625rem] leading-[1.47] text-[#6E6E73]'>
              Agrega una nueva lámpara al catálogo y sube
              directamente sus fotografías a almacenamiento
              seguro.
            </p>
          </div>

          <form onSubmit={submit}>
            <div className='grid gap-8 lg:grid-cols-[1fr_430px]'>
              {/* LEFT */}
              <div className='space-y-6'>
                {/* SECURITY */}
                <section className={CARD_CLS}>
                  <div className='mb-5'>
                    <div className={EYEBROW_CLS}>
                      Seguridad
                    </div>

                    <h2 className={H2_CLS}>
                      Acceso administrativo
                    </h2>
                  </div>

                  <input
                    type='password'
                    value={adminKey}
                    onChange={event =>
                      setAdminKey(event.target.value)
                    }
                    placeholder='Clave administrativa'
                    autoComplete='current-password'
                    className={`h-12 ${INPUT_CLS}`}
                  />
                </section>

                {/* PRODUCT */}
                <section className={CARD_CLS}>
                  <div className='mb-6'>
                    <div className={EYEBROW_CLS}>
                      Producto
                    </div>

                    <h2 className={H2_CLS}>
                      Información de la lámpara
                    </h2>
                  </div>

                  <div className='space-y-5'>
                    <Field
                      label='Título'
                      placeholder='Ej. VoroGlow'
                      value={form.title}
                      onChange={value =>
                        updateField('title', value)
                      }
                    />

                    <Field
                      label='Subtítulo'
                      placeholder='Ej. Diseño contemporáneo'
                      value={form.subtitle}
                      onChange={value =>
                        updateField('subtitle', value)
                      }
                    />

                    <div>
                      <label className={LABEL_CLS}>
                        Descripción
                      </label>

                      <textarea
                        rows={6}
                        value={form.description}
                        onChange={event =>
                          updateField(
                            'description',
                            event.target.value
                          )
                        }
                        placeholder='Describe el diseño, materiales, ambiente y características...'
                        className={`resize-y py-3 leading-[1.5] ${INPUT_CLS}`}
                      />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div>
                        <label className={LABEL_CLS}>
                          Categoría
                        </label>

                        <select
                          value={form.category}
                          onChange={event =>
                            updateField(
                              'category',
                              event.target.value as Category
                            )
                          }
                          className={`h-12 ${INPUT_CLS}`}
                        >
                          {CATEGORIES.map(category => (
                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Field
                        label='Precio (COP)'
                        type='number'
                        min='0'
                        placeholder='79900'
                        value={form.price}
                        onChange={value =>
                          updateField('price', value)
                        }
                      />
                    </div>

                    <div className='grid gap-3 sm:grid-cols-2'>
                      <Toggle
                        label='Producto destacado'
                        checked={form.featured}
                        onChange={value =>
                          updateField(
                            'featured',
                            value
                          )
                        }
                      />

                      <Toggle
                        label='Producto popular'
                        checked={form.popular}
                        onChange={value =>
                          updateField(
                            'popular',
                            value
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* IMAGES */}
                <section className={CARD_CLS}>
                  <div className='mb-6 flex items-start justify-between gap-4'>
                    <div>
                      <div className={EYEBROW_CLS}>
                        Fotografías
                      </div>

                      <h2 className={H2_CLS}>
                        Imágenes del producto
                      </h2>

                      <p className='mt-2 text-[0.9375rem] leading-[1.45] text-[#6E6E73]'>
                        Selecciona los archivos directamente
                        desde tu computador.
                      </p>
                    </div>

                    <span className='shrink-0 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[0.8125rem] font-medium tabular-nums text-[#6E6E73]'>
                      {images.length}/{MAX_IMAGES}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/avif'
                    multiple
                    onChange={handleImageSelect}
                    className='hidden'
                  />

                  <motion.button
                    type='button'
                    onClick={openFilePicker}
                    disabled={pickerDisabled}
                    whileTap={pickerDisabled ? undefined : PRESS.whileTap}
                    transition={PRESS_SPRING}
                    className={`group flex min-h-[180px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/15 bg-[#F5F5F7] px-6 text-center transition-colors duration-200 hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
                  >
                    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#C98A2E]/15 text-[#96600F]'>
                      <ImagePlus className='h-6 w-6' aria-hidden='true' />
                    </div>

                    <div className='mt-4 text-[1.0625rem] font-semibold'>
                      Seleccionar fotografías
                    </div>

                    <div className='mt-1 text-[0.8125rem] tracking-[0.01em] text-[#6E6E73]'>
                      JPG, PNG, WEBP o AVIF · máximo 15 MB
                      por imagen
                    </div>
                  </motion.button>

                  {images.length > 0 && (
                    <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3'>
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          className={`group relative overflow-hidden rounded-2xl transition-shadow duration-200 ${
                            index === activeImage
                              ? 'ring-2 ring-[#96600F] ring-offset-2 ring-offset-white'
                              : ''
                          }`}
                        >
                          <button
                            type='button'
                            onClick={() =>
                              setActiveImage(index)
                            }
                            className={`block aspect-square w-full bg-[#F5F5F7] ${FOCUS}`}
                          >
                            <img
                              src={image.preview}
                              alt={image.file.name}
                              className='h-full w-full object-cover'
                            />
                          </button>

                          <div
                            className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[0.75rem] font-medium tracking-[0.01em] text-[#1D1D1F] ${GLASS_LIGHT}`}
                          >
                            {index === 0
                              ? 'Portada'
                              : index + 1}
                          </div>

                          <button
                            type='button'
                            onClick={() =>
                              removeImage(image.id)
                            }
                            className={`absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-[#1D1D1F] transition duration-200 hover:bg-[#D70015] hover:text-white active:scale-95 ${GLASS_LIGHT} ${FOCUS}`}
                            aria-label='Eliminar imagen'
                          >
                            <X className='h-4 w-4' aria-hidden='true' />
                          </button>

                          <div className='absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100'>
                            <button
                              type='button'
                              disabled={index === 0}
                              onClick={() =>
                                moveImage(index, 'left')
                              }
                              aria-label='Mover a la izquierda'
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-[#1D1D1F] transition duration-200 hover:bg-white active:scale-95 disabled:opacity-30 ${GLASS_LIGHT} ${FOCUS}`}
                            >
                              <ChevronLeft className='h-4 w-4' aria-hidden='true' />
                            </button>

                            <button
                              type='button'
                              disabled={
                                index ===
                                images.length - 1
                              }
                              onClick={() =>
                                moveImage(
                                  index,
                                  'right'
                                )
                              }
                              aria-label='Mover a la derecha'
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-[#1D1D1F] transition duration-200 hover:bg-white active:scale-95 disabled:opacity-30 ${GLASS_LIGHT} ${FOCUS}`}
                            >
                              <ChevronRight className='h-4 w-4' aria-hidden='true' />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {loading && images.length > 0 && (
                    <div className='mt-6'>
                      <div className='mb-2 flex justify-between text-[0.8125rem] font-medium tabular-nums'>
                        <span>
                          Subiendo fotografías a S3
                        </span>

                        <span>
                          {uploadProgress}%
                        </span>
                      </div>

                      <div className='h-2 overflow-hidden rounded-full bg-black/[0.08]'>
                        <motion.div
                          className='h-full rounded-full bg-[#96600F]'
                          initial={false}
                          animate={{
                            width: `${uploadProgress}%`
                          }}
                          transition={{
                            type: 'spring',
                            bounce: 0,
                            duration: 0.4
                          }}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* FEEDBACK */}
                {error && (
                  <div
                    role='alert'
                    className='rounded-2xl bg-[#FDECEA] px-5 py-4 text-[0.9375rem] leading-snug text-[#B00012]'
                  >
                    {error}
                  </div>
                )}

                {message && (
                  <div
                    role='status'
                    className='flex items-center gap-3 rounded-2xl bg-[#E8F5EC] px-5 py-4 text-[0.9375rem] leading-snug text-[#1E6B32]'
                  >
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#248A3D] text-white'>
                      <Check className='h-4 w-4' aria-hidden='true' />
                    </div>

                    {message}
                  </div>
                )}
              </div>

              {/* RIGHT: PREVIEW */}
              <aside className='lg:sticky lg:top-8 lg:h-fit'>
                {/* Same card as the catalog: 28px card, 12px inset, 16px well. */}
                <div className='overflow-hidden rounded-[28px] bg-white p-3 shadow-[0_24px_70px_rgba(0,0,0,0.08)]'>
                  <div className='relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F5F5F7]'>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt='Vista previa'
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full flex-col items-center justify-center px-8 text-center'>
                        <Upload
                          className='h-10 w-10 text-[#96600F]/60'
                          aria-hidden='true'
                        />

                        <p className='mt-4 text-xl font-semibold tracking-[-0.01em] text-[#1D1D1F]'>
                          Vista previa
                        </p>

                        <p className='mt-2 text-[0.9375rem] leading-[1.45] text-[#6E6E73]'>
                          Las fotografías seleccionadas
                          aparecerán aquí.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className='px-3 pb-2 pt-5'>
                    <div className='text-[0.8125rem] font-medium tracking-[0.01em] text-[#96600F]'>
                      Vanguard Lighting
                    </div>

                    <h3 className='mt-1 text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1D1D1F]'>
                      {form.title ||
                        'Nombre del producto'}
                    </h3>

                    <p className='mt-1 text-[0.9375rem] leading-snug text-[#6E6E73]'>
                      {form.subtitle ||
                        'Subtítulo del producto'}
                    </p>

                    <div className='mt-4 text-xl font-semibold tracking-[-0.015em] text-[#1D1D1F]'>
                      {formattedPrice}
                    </div>

                    <div className='mt-6 flex items-center justify-between text-[0.9375rem] text-[#6E6E73]'>
                      <span>Fotografías</span>
                      <span className='tabular-nums'>
                        {images.length}
                      </span>
                    </div>

                    <motion.button
                      type='submit'
                      disabled={loading}
                      whileTap={loading ? undefined : PRESS.whileTap}
                      transition={PRESS_SPRING}
                      className={`mt-5 w-full gap-3 ${BTN_BASE} ${BTN_PRIMARY}`}
                    >
                      {loading ? (
                        <>
                          <Loader2
                            className='h-4 w-4 animate-spin'
                            aria-hidden='true'
                          />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Check className='h-4 w-4' aria-hidden='true' />
                          Crear producto
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>
    </MotionConfig>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  min?: string
}) {
  return (
    <div>
      <label className={LABEL_CLS}>
        {label}
      </label>

      <input
        type={type}
        min={min}
        value={value}
        onChange={event =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`h-12 ${INPUT_CLS}`}
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <motion.button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      {...PRESS}
      className={`flex min-h-12 items-center justify-between gap-3 rounded-xl bg-[#F5F5F7] px-4 py-2 text-left ${FOCUS}`}
    >
      <span className='text-[0.9375rem] font-medium'>
        {label}
      </span>

      {/* iOS-style switch: 51×31 track, 27px knob that glides on a spring. */}
      <span
        className={`flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-200 ${
          checked
            ? 'justify-end bg-[#34C759]'
            : 'justify-start bg-black/[0.16]'
        }`}
      >
        <motion.span
          layout
          transition={PRESS_SPRING}
          className='h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)]'
        />
      </span>
    </motion.button>
  )
}