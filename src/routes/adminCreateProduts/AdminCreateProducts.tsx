import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X
} from 'lucide-react'

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

  return (
    <main className='min-h-screen bg-[#F4EFE6] px-5 py-10 text-[#171512] sm:px-8 lg:px-12'>
      <div className='mx-auto max-w-7xl'>
        {/* HEADER */}
        <div className='mb-10'>
          <div className='text-[10px] font-bold uppercase tracking-[0.25em] text-[#AE8243]'>
            Vanguard · Administración
          </div>

          <h1
            className='mt-3 text-4xl font-black tracking-tight sm:text-5xl'
            style={{
              fontFamily: 'var(--font-display)'
            }}
          >
            Nuevo producto
          </h1>

          <p className='mt-3 max-w-2xl text-sm leading-6 text-[#6F695F]'>
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
              <section className='rounded-[2rem] border border-[#D9D0C0] bg-white p-6 shadow-[0_18px_50px_rgba(23,21,18,0.05)]'>
                <div className='mb-5'>
                  <div className='text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8243]'>
                    Seguridad
                  </div>

                  <h2
                    className='mt-2 text-xl font-black'
                    style={{
                      fontFamily:
                        'var(--font-display)'
                    }}
                  >
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
                  className='h-12 w-full rounded-xl border border-[#D9D0C0] bg-[#FBF9F5] px-4 text-sm outline-none transition focus:border-[#AE8243] focus:ring-2 focus:ring-[#D7A451]/20'
                />
              </section>

              {/* PRODUCT */}
              <section className='rounded-[2rem] border border-[#D9D0C0] bg-white p-6 shadow-[0_18px_50px_rgba(23,21,18,0.05)]'>
                <div className='mb-6'>
                  <div className='text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8243]'>
                    Producto
                  </div>

                  <h2
                    className='mt-2 text-xl font-black'
                    style={{
                      fontFamily:
                        'var(--font-display)'
                    }}
                  >
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
                    <label className='mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#7B756C]'>
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
                      className='w-full resize-y rounded-xl border border-[#D9D0C0] bg-[#FBF9F5] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#AE8243] focus:ring-2 focus:ring-[#D7A451]/20'
                    />
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#7B756C]'>
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
                        className='h-12 w-full rounded-xl border border-[#D9D0C0] bg-[#FBF9F5] px-4 text-sm outline-none focus:border-[#AE8243]'
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
              <section className='rounded-[2rem] border border-[#D9D0C0] bg-white p-6 shadow-[0_18px_50px_rgba(23,21,18,0.05)]'>
                <div className='mb-6 flex items-start justify-between gap-4'>
                  <div>
                    <div className='text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8243]'>
                      Fotografías
                    </div>

                    <h2
                      className='mt-2 text-xl font-black'
                      style={{
                        fontFamily:
                          'var(--font-display)'
                      }}
                    >
                      Imágenes del producto
                    </h2>

                    <p className='mt-2 text-xs leading-5 text-[#7B756C]'>
                      Selecciona los archivos directamente
                      desde tu computador.
                    </p>
                  </div>

                  <span className='shrink-0 rounded-full bg-[#F4EFE6] px-3 py-1.5 text-[10px] font-bold text-[#7B756C]'>
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

                <button
                  type='button'
                  onClick={openFilePicker}
                  disabled={
                    images.length >= MAX_IMAGES ||
                    loading
                  }
                  className='group flex min-h-[180px] w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#D8CCBA] bg-[#FBF9F5] px-6 text-center transition hover:border-[#AE8243] hover:bg-[#F7F1E7] disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#171512] text-[#F6D79D] transition group-hover:scale-105'>
                    <ImagePlus className='h-6 w-6' />
                  </div>

                  <div className='mt-4 text-sm font-bold'>
                    Seleccionar fotografías
                  </div>

                  <div className='mt-1 text-xs text-[#8C857B]'>
                    JPG, PNG, WEBP o AVIF · máximo 15 MB
                    por imagen
                  </div>
                </button>

                {images.length > 0 && (
                  <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`group relative overflow-hidden rounded-2xl border ${
                          index === activeImage
                            ? 'border-[#AE8243] ring-2 ring-[#D7A451]/20'
                            : 'border-[#DED6C9]'
                        }`}
                      >
                        <button
                          type='button'
                          onClick={() =>
                            setActiveImage(index)
                          }
                          className='block aspect-square w-full bg-[#F7F3EC]'
                        >
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className='h-full w-full object-cover'
                          />
                        </button>

                        <div className='absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-bold text-white backdrop-blur'>
                          {index === 0
                            ? 'PORTADA'
                            : index + 1}
                        </div>

                        <button
                          type='button'
                          onClick={() =>
                            removeImage(image.id)
                          }
                          className='absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-[#9A4B3F]'
                          aria-label='Eliminar imagen'
                        >
                          <X className='h-4 w-4' />
                        </button>

                        <div className='absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 transition group-hover:opacity-100'>
                          <button
                            type='button'
                            disabled={index === 0}
                            onClick={() =>
                              moveImage(index, 'left')
                            }
                            className='flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-30'
                          >
                            <ChevronLeft className='h-4 w-4' />
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
                            className='flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-30'
                          >
                            <ChevronRight className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {loading && images.length > 0 && (
                  <div className='mt-6'>
                    <div className='mb-2 flex justify-between text-xs font-bold'>
                      <span>
                        Subiendo fotografías a S3
                      </span>

                      <span>
                        {uploadProgress}%
                      </span>
                    </div>

                    <div className='h-2 overflow-hidden rounded-full bg-[#EAE3D8]'>
                      <div
                        className='h-full rounded-full bg-[#AE8243] transition-all duration-300'
                        style={{
                          width: `${uploadProgress}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* FEEDBACK */}
              {error && (
                <div className='rounded-2xl border border-[#E1B9B1] bg-[#FFF5F2] px-4 py-3 text-sm text-[#8E4338]'>
                  {error}
                </div>
              )}

              {message && (
                <div className='flex items-center gap-3 rounded-2xl border border-[#BBD4C0] bg-[#F3FAF4] px-4 py-3 text-sm text-[#356C42]'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDEFE0]'>
                    <Check className='h-4 w-4' />
                  </div>

                  {message}
                </div>
              )}
            </div>

            {/* RIGHT: PREVIEW */}
            <aside className='lg:sticky lg:top-8 lg:h-fit'>
              <div className='overflow-hidden rounded-[2rem] border border-[#D9D0C0] bg-[#171512] shadow-[0_25px_70px_rgba(23,21,18,0.16)]'>
                <div className='relative aspect-[4/5] overflow-hidden bg-[#24211D]'>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt='Vista previa'
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full flex-col items-center justify-center px-8 text-center'>
                      <Upload className='h-10 w-10 text-[#D7A451]/60' />

                      <p
                        className='mt-4 text-xl font-black text-white'
                        style={{
                          fontFamily:
                            'var(--font-display)'
                        }}
                      >
                        Vista previa
                      </p>

                      <p className='mt-2 text-xs leading-5 text-white/40'>
                        Las fotografías seleccionadas
                        aparecerán aquí.
                      </p>
                    </div>
                  )}

                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 pt-20'>
                    <div className='text-[9px] font-bold uppercase tracking-[0.2em] text-[#F6D79D]'>
                      Vanguard Lighting
                    </div>

                    <h3
                      className='mt-2 text-3xl font-black tracking-tight text-white'
                      style={{
                        fontFamily:
                          'var(--font-display)'
                      }}
                    >
                      {form.title ||
                        'Nombre del producto'}
                    </h3>

                    <p className='mt-1 text-sm text-white/55'>
                      {form.subtitle ||
                        'Subtítulo del producto'}
                    </p>

                    <div className='mt-5 text-2xl font-black text-[#F6D79D]'>
                      {formattedPrice}
                    </div>
                  </div>
                </div>

                <div className='p-5'>
                  <div className='flex items-center justify-between text-xs text-white/45'>
                    <span>Fotografías</span>
                    <span>
                      {images.length}
                    </span>
                  </div>

                  <button
                    type='submit'
                    disabled={loading}
                    className='mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D7A451] px-6 text-sm font-black text-[#171512] transition hover:bg-[#F6D79D] disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {loading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className='h-4 w-4' />
                        Crear producto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
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
      <label className='mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#7B756C]'>
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
        className='h-12 w-full rounded-xl border border-[#D9D0C0] bg-[#FBF9F5] px-4 text-sm outline-none transition focus:border-[#AE8243] focus:ring-2 focus:ring-[#D7A451]/20'
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
    <button
      type='button'
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-xl border px-4 text-left transition ${
        checked
          ? 'border-[#AE8243] bg-[#FBF3E4]'
          : 'border-[#D9D0C0] bg-[#FBF9F5]'
      }`}
    >
      <span className='text-xs font-bold'>
        {label}
      </span>

      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked
            ? 'bg-[#AE8243]'
            : 'bg-[#D4CEC3]'
        }`}
      >
        <span
          className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${
            checked
              ? 'left-5'
              : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}