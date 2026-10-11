import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MotionConfig, motion, type Transition } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Clock3,
  Home,
  Loader2,
  RefreshCw,
  ShoppingBag,
  X
} from 'lucide-react'

type PaymentStatus =
  | 'checking'
  | 'approved'
  | 'pending'
  | 'declined'
  | 'voided'
  | 'error'

type PaymentStatusResponse = {
  status?: string
  transactionId?: string
  reference?: string
  orderId?: string
}

const STATUS_ENDPOINT =
  import.meta.env.VITE_WOMPI_STATUS_API || ''

const normalizeStatus = (
  value?: string
): PaymentStatus => {
  switch (value?.toUpperCase()) {
    case 'APPROVED':
      return 'approved'

    case 'PENDING':
    case 'IN_PROCESS':
      return 'pending'

    case 'DECLINED':
      return 'declined'

    case 'VOIDED':
      return 'voided'

    case 'ERROR':
      return 'error'

    default:
      return 'checking'
  }
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/*  ink       #1D1D1F  primary text / primary button                          */
/*  muted     #6E6E73  secondary text                                         */
/*  surface   #F5F5F7  grouped background                                     */
/*  accent-tx #96600F  brand text (AA on white and on surface)                */
/*  success   #248A3D  /  danger #D70015  (icon fills)                        */
/* -------------------------------------------------------------------------- */

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif`

/* Critically damped springs: nothing here carries momentum, so nothing
   overshoots. They retarget from the live value, so a status change mid-motion
   never jumps. */
const PRESS_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.3 }

const SETTLE_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.5 }

/* Press feedback begins on pointer-down and is reversible mid-press. */
const PRESS = {
  whileTap: { scale: 0.97 },
  transition: PRESS_SPRING
} as const

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96600F]'

const BTN_BASE = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[1.0625rem] font-medium tracking-[-0.005em] transition-colors duration-200 ${FOCUS}`

const BTN_PRIMARY = 'bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]'

const BTN_SECONDARY = 'bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10'
export default function PaymentSuccessful() {
  const [searchParams] = useSearchParams()

  const transactionId =
    searchParams.get('id') || ''

  const paymentReference =
    searchParams.get('reference') || ''

  const [status, setStatus] =
    useState<PaymentStatus>('checking')

  const [orderId, setOrderId] =
    useState('')

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (!transactionId && !paymentReference) {
      setStatus('error')

      setError(
        'No encontramos la información necesaria para identificar este pago.'
      )

      return
    }

    /*
     * Until the backend status endpoint exists,
     * stay in a safe "checking" state.
     *
     * The redirect itself is NOT proof of payment.
     */
    if (!STATUS_ENDPOINT) {
      return
    }

    let cancelled = false

    let intervalId: number | undefined

    const checkPayment = async () => {
      try {
        const params = new URLSearchParams()

        if (transactionId) {
          params.set(
            'transactionId',
            transactionId
          )
        }

        if (paymentReference) {
          params.set(
            'reference',
            paymentReference
          )
        }

        const response = await fetch(
          `${STATUS_ENDPOINT}?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json'
            },
            cache: 'no-store'
          }
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible consultar el estado del pago.'
          )
        }

        const result: PaymentStatusResponse =
          await response.json()

        if (cancelled) return

        const nextStatus =
          normalizeStatus(result.status)

        setStatus(nextStatus)

        if (result.orderId) {
          setOrderId(result.orderId)
        }

        if (
          nextStatus === 'approved' ||
          nextStatus === 'declined' ||
          nextStatus === 'voided' ||
          nextStatus === 'error'
        ) {
          if (intervalId) {
            window.clearInterval(intervalId)
          }
        }
      } catch (requestError) {
        if (cancelled) return

        console.error(
          'Payment status error:',
          requestError
        )

        /*
         * A status-query failure does NOT mean
         * the payment failed.
         */
        setError(
          'Estamos teniendo dificultades para consultar el estado del pago.'
        )
      }
    }

    checkPayment()

    intervalId = window.setInterval(
      checkPayment,
      3000
    )

    return () => {
      cancelled = true

      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [transactionId, paymentReference])

  const title =
    status === 'approved'
      ? 'Pago confirmado'
      : status === 'pending'
        ? 'Pago en proceso'
        : status === 'declined'
          ? 'Pago no aprobado'
          : status === 'voided'
            ? 'Pago anulado'
            : status === 'error'
              ? 'No pudimos verificar el pago'
              : 'Verificando tu pago'

  const description =
    status === 'approved'
      ? 'Tu pedido ha sido confirmado correctamente. Estamos preparando la siguiente etapa.'
      : status === 'pending'
        ? 'Tu pago todavía está siendo procesado. No necesitas realizar otro pago.'
        : status === 'declined'
          ? 'El pago no fue aprobado. Puedes regresar al catálogo e intentarlo nuevamente.'
          : status === 'voided'
            ? 'La transacción fue anulada. Puedes regresar al catálogo para realizar una nueva compra.'
            : status === 'error'
              ? error ||
                'No pudimos confirmar el estado de tu pago en este momento.'
              : 'Estamos confirmando la transacción con nuestro sistema de pagos. Esto puede tardar unos segundos.'

  const isNegative =
    status === 'declined' ||
    status === 'voided' ||
    status === 'error'

  return (
    // Reduced motion: transforms are dropped, opacity fades are kept.
    <MotionConfig reducedMotion='user'>
      <div
        className='min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased [font-optical-sizing:auto]'
        style={{ fontFamily: FONT_STACK }}
      >
        {/* MAIN */}
        <main className='relative flex min-h-[calc(100vh-81px)] items-center overflow-hidden px-6 py-16 lg:px-10'>
          <div className='relative mx-auto w-full max-w-4xl'>
            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                y: SETTLE_SPRING,
                opacity: { duration: 0.4, ease: 'easeOut' }
              }}
              className='overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]'
            >
              {/* STATUS HERO */}
              <div
                aria-live='polite'
                className='px-6 pb-4 pt-16 text-center sm:px-12'
              >
                <motion.div
                  key={status}
                  initial={{
                    opacity: 0,
                    scale: 0.9
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  transition={{
                    scale: SETTLE_SPRING,
                    opacity: { duration: 0.25, ease: 'easeOut' }
                  }}
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                    status === 'approved'
                      ? 'bg-[#248A3D] text-white'
                      : isNegative
                        ? 'bg-[#D70015] text-white'
                        : status === 'pending'
                          ? 'bg-[#C98A2E]/20 text-[#96600F]'
                          : 'bg-[#F5F5F7] text-[#6E6E73]'
                  }`}
                >
                  {status === 'approved' ? (
                    <Check
                      className='h-10 w-10'
                      strokeWidth={2.5}
                      aria-hidden='true'
                    />
                  ) : isNegative ? (
                    <X
                      className='h-9 w-9'
                      strokeWidth={2.5}
                      aria-hidden='true'
                    />
                  ) : status === 'pending' ? (
                    <Clock3 className='h-9 w-9' aria-hidden='true' />
                  ) : (
                    <Loader2
                      className='h-9 w-9 animate-spin'
                      aria-hidden='true'
                    />
                  )}
                </motion.div>

                <div className='mt-7 text-[0.9375rem] font-semibold leading-snug text-[#6E6E73]'>
                  Estado del pago
                </div>

                <motion.h1
                  key={`${status}-title`}
                  initial={{
                    opacity: 0,
                    y: 8
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    y: SETTLE_SPRING,
                    opacity: { duration: 0.25, ease: 'easeOut' }
                  }}
                  className='mt-2 text-[clamp(2.25rem,5vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#1D1D1F]'
                >
                  {title}
                </motion.h1>

                <p className='mx-auto mt-4 max-w-2xl text-[1.0625rem] leading-[1.47] text-[#6E6E73] sm:text-xl sm:leading-[1.4]'>
                  {description}
                </p>
              </div>

              {/* DETAILS */}
              <div className='p-6 sm:p-10 lg:p-12'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <InfoCard
                    label='Referencia de compra'
                    value={
                      paymentReference ||
                      'No disponible'
                    }
                  />

                  <InfoCard
                    label='Transacción Wompi'
                    value={
                      transactionId ||
                      'No disponible'
                    }
                  />

                  {orderId && (
                    <InfoCard
                      label='Pedido'
                      value={orderId}
                    />
                  )}
                </div>

                {/* CHECKING */}
                {status === 'checking' && (
                  <div className='mt-6 rounded-2xl bg-[#F5F5F7] px-5 py-4'>
                    <div className='flex items-start gap-3'>
                      <Loader2
                        className='mt-0.5 h-5 w-5 shrink-0 animate-spin text-[#6E6E73]'
                        aria-hidden='true'
                      />

                      <div>
                        <div className='text-[0.9375rem] font-semibold text-[#1D1D1F]'>
                          Estamos verificando tu pago
                        </div>

                        <p className='mt-1 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                          No vuelvas a realizar el pago mientras
                          confirmamos la transacción.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PENDING */}
                {status === 'pending' && (
                  <div className='mt-6 rounded-2xl bg-[#FFF4DB] px-5 py-4'>
                    <div className='flex items-start gap-3'>
                      <Clock3
                        className='mt-0.5 h-5 w-5 shrink-0 text-[#96600F]'
                        aria-hidden='true'
                      />

                      <div>
                        <div className='text-[0.9375rem] font-semibold text-[#1D1D1F]'>
                          El pago está siendo procesado
                        </div>

                        <p className='mt-1 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                          Estamos esperando la confirmación final de
                          Wompi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* APPROVED */}
                {status === 'approved' && (
                  <div className='mt-6 rounded-2xl bg-[#E8F5EC] px-5 py-4'>
                    <div className='flex items-start gap-3'>
                      <Check
                        className='mt-0.5 h-5 w-5 shrink-0 text-[#248A3D]'
                        aria-hidden='true'
                      />

                      <div>
                        <div className='text-[0.9375rem] font-semibold text-[#1D1D1F]'>
                          Tu compra está confirmada
                        </div>

                        <p className='mt-1 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                          Guarda tu referencia de compra. La
                          utilizaremos para identificar tu pedido.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DECLINED / VOIDED */}
                {(status === 'declined' ||
                  status === 'voided') && (
                  <div className='mt-6 rounded-2xl bg-[#FDECEA] px-5 py-4'>
                    <div className='flex items-start gap-3'>
                      <X
                        className='mt-0.5 h-5 w-5 shrink-0 text-[#B00012]'
                        aria-hidden='true'
                      />

                      <div>
                        <div className='text-[0.9375rem] font-semibold text-[#1D1D1F]'>
                          No se completó el pago
                        </div>

                        <p className='mt-1 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                          Puedes regresar al catálogo y comenzar un
                          nuevo intento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERROR */}
                {status === 'error' && (
                  <div className='mt-6 rounded-2xl bg-[#FDECEA] px-5 py-4'>
                    <div className='flex items-start gap-3'>
                      <X
                        className='mt-0.5 h-5 w-5 shrink-0 text-[#B00012]'
                        aria-hidden='true'
                      />

                      <div>
                        <div className='text-[0.9375rem] font-semibold text-[#1D1D1F]'>
                          No pudimos verificar el estado
                        </div>

                        <p className='mt-1 text-[0.9375rem] leading-[1.5] text-[#6E6E73]'>
                          Esto no significa necesariamente que el pago
                          haya fallado. Puedes volver a consultar el
                          estado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error &&
                  status !== 'error' && (
                    <div className='mt-4 text-[0.9375rem] text-[#B00012]'>
                      {error}
                    </div>
                  )}

                {/* ACTIONS */}
                <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center'>
                  {(status === 'error' ||
                    status === 'declined' ||
                    status === 'voided') && (
                    <motion.button
                      type='button'
                      onClick={() =>
                        window.location.reload()
                      }
                      {...PRESS}
                      className={`${BTN_BASE} ${BTN_SECONDARY}`}
                    >
                      <RefreshCw className='h-4 w-4' aria-hidden='true' />
                      Volver a verificar
                    </motion.button>
                  )}

                  <motion.div className='flex' {...PRESS}>
                    <Link
                      to='/catalog'
                      className={`w-full ${BTN_BASE} ${BTN_PRIMARY}`}
                    >
                      <ShoppingBag className='h-4 w-4' aria-hidden='true' />
                      Ver catálogo
                    </Link>
                  </motion.div>

                  <motion.div className='flex' {...PRESS}>
                    <Link
                      to='/'
                      className={`w-full ${BTN_BASE} ${BTN_SECONDARY}`}
                    >
                      <Home className='h-4 w-4' aria-hidden='true' />
                      Inicio
                    </Link>
                  </motion.div>
                </div>

                {/* FOOTER */}
                <div className='mt-10 flex flex-col items-center justify-between gap-3 text-center text-[0.8125rem] tracking-[0.01em] text-[#6E6E73] sm:flex-row sm:text-left'>
                  <span>
                    Pago procesado mediante Wompi
                  </span>

                  <Link
                    to='/catalog'
                    className={`inline-flex min-h-11 items-center gap-1.5 font-medium text-[#96600F] transition-opacity duration-200 hover:opacity-70 ${FOCUS}`}
                  >
                    <ArrowLeft className='h-3.5 w-3.5' aria-hidden='true' />
                    Volver a la colección
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}

function InfoCard({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className='rounded-2xl bg-[#F5F5F7] p-4'>
      <div className='text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]'>
        {label}
      </div>

      <div className='mt-1.5 break-all text-[0.9375rem] font-semibold text-[#1D1D1F]'>
        {value}
      </div>
    </div>
  )
}