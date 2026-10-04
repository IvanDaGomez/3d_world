import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
import { motion } from 'framer-motion'

type PaymentStatus =
  | 'checking'
  | 'approved'
  | 'pending'
  | 'declined'
  | 'voided'
  | 'error'

type PaymentResponse = {
  status?: string
  reference?: string
  transactionId?: string
  orderId?: string
}

const STATUS_ENDPOINT =
  import.meta.env.VITE_WOMPI_STATUS_API || ''

const normalizeStatus = (
  status?: string
): PaymentStatus => {
  switch (status?.toUpperCase()) {
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

export default function PaymentResponse() {
  const [searchParams] = useSearchParams()

  const transactionId =
    searchParams.get('id') || ''

  const reference =
    searchParams.get('reference') || ''

  const [status, setStatus] =
    useState<PaymentStatus>(
      transactionId || reference
        ? 'checking'
        : 'error'
    )

  const [orderId, setOrderId] =
    useState('')

  const [error, setError] =
    useState(
      transactionId || reference
        ? ''
        : 'No encontramos la información necesaria para consultar este pago.'
    )

  useEffect(() => {

    if (!transactionId && !reference) {
      return
    }

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

        if (reference) {
          params.set(
            'reference',
            reference
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

        const data: PaymentResponse =
          await response.json()

        if (cancelled) return

        const normalized =
          normalizeStatus(data.status)

        setStatus(normalized)

        if (data.orderId) {
          setOrderId(data.orderId)
        }
        intervalId = window.setInterval(
          checkPayment,
          3000
        )
        if (
          normalized !== 'checking' &&
          normalized !== 'pending'
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
         * Don't immediately tell the customer
         * that payment failed. A status endpoint
         * failure is not the same thing as a
         * failed transaction.
         */
        setError(
          'Estamos teniendo dificultades para consultar el estado del pago.'
        )
      }
    }

    checkPayment()

    /*
     * Poll every 3 seconds while payment is pending.
     * The backend remains the authority.
     */
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
  }, [reference, transactionId])

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
      ? 'Tu pedido ha sido confirmado correctamente. Estamos preparando la siguiente etapa de producción.'
      : status === 'pending'
        ? 'Tu pago todavía está siendo procesado. No necesitas volver a realizar el pago.'
        : status === 'declined'
          ? 'El pago no fue aprobado. Puedes regresar al catálogo e intentarlo nuevamente.'
          : status === 'voided'
            ? 'Esta transacción fue anulada. Puedes volver al catálogo para realizar una nueva compra.'
            : status === 'error'
              ? error ||
                'No pudimos confirmar el estado de tu pago en este momento.'
              : 'Estamos confirmando la transacción con nuestro sistema de pagos. Esto puede tardar unos segundos.'

  return (
    <div className='min-h-screen bg-[#F4F1EA] text-[#171512]'>


      {/* Main */}
      <main className='relative flex min-h-[calc(100vh-81px)] items-center overflow-hidden px-6 py-16 lg:px-10'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(circle at 50% 20%, rgba(215,164,81,.14), transparent 35%), radial-gradient(circle at 90% 90%, rgba(215,164,81,.08), transparent 30%)'
          }}
        />

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
              duration: 0.5
            }}
            className='overflow-hidden rounded-[2rem] border border-[#D9D1C2] bg-[#F8F5EF] shadow-[0_35px_100px_rgba(34,29,20,0.14)]'
          >
            {/* Top visual */}
            <div className='bg-[#171512] px-6 py-16 text-center sm:px-12'>
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
                className='mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.07]'
              >
                {status === 'approved' ? (
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#3D8A5A] text-white'>
                    <Check className='h-8 w-8' strokeWidth={2.5} />
                  </div>
                ) : status ===
                  'declined' ||
                  status === 'voided' ||
                  status === 'error' ? (
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#9A4B3F] text-white'>
                    <X className='h-7 w-7' strokeWidth={2.5} />
                  </div>
                ) : status === 'pending' ? (
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#D7A451] text-[#171512]'>
                    <Clock3 className='h-7 w-7' />
                  </div>
                ) : (
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#F6D79D]'>
                    <Loader2 className='h-7 w-7 animate-spin' />
                  </div>
                )}
              </motion.div>

              <div className='mt-7 text-[10px] font-bold uppercase tracking-[0.22em] text-[#D7A451]'>
                Estado del pedido
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
                className='mt-3 text-4xl font-black tracking-[-0.04em] text-[#F7F5EF] sm:text-5xl'
                style={{
                  fontFamily:
                    'var(--font-display)'
                }}
              >
                {title}
              </motion.h1>

              <p className='mx-auto mt-5 max-w-2xl text-base leading-7 text-[#CBC7BF]'>
                {description}
              </p>
            </div>

            {/* Information */}
            <div className='p-6 sm:p-10 lg:p-12'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <InfoCard
                  label='Referencia'
                  value={
                    reference || 'No disponible'
                  }
                />

                <InfoCard
                  label='Transacción'
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

              {status === 'checking' && (
                <div className='mt-8 rounded-2xl border border-[#D9D1C2] bg-white px-5 py-4'>
                  <div className='flex items-start gap-3'>
                    <Loader2 className='mt-0.5 h-5 w-5 shrink-0 animate-spin text-[#AE8243]' />

                    <div>
                      <div className='text-sm font-bold text-[#171512]'>
                        No cierres esta ventana
                      </div>

                      <p className='mt-1 text-sm leading-6 text-[#716C63]'>
                        Estamos verificando la transacción con
                        nuestro sistema. No vuelvas a pagar mientras
                        esta pantalla esté comprobando el estado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'pending' && (
                <div className='mt-8 rounded-2xl border border-[#E2D2A5] bg-[#FFF9E9] px-5 py-4'>
                  <div className='flex items-start gap-3'>
                    <Clock3 className='mt-0.5 h-5 w-5 shrink-0 text-[#AE8243]' />

                    <div>
                      <div className='text-sm font-bold text-[#171512]'>
                        Estamos esperando confirmación
                      </div>

                      <p className='mt-1 text-sm leading-6 text-[#716C63]'>
                        El pago puede tardar unos momentos en
                        confirmarse. No necesitas repetir la compra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'approved' && (
                <div className='mt-8 rounded-2xl border border-[#BFD8C7] bg-[#F3FAF5] px-5 py-4'>
                  <div className='flex items-start gap-3'>
                    <Check className='mt-0.5 h-5 w-5 shrink-0 text-[#3D8A5A]' />

                    <div>
                      <div className='text-sm font-bold text-[#171512]'>
                        Pedido confirmado
                      </div>

                      <p className='mt-1 text-sm leading-6 text-[#5F665F]'>
                        Conserva tu referencia de compra. La
                        utilizaremos para identificar y procesar tu
                        pedido.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(status === 'declined' ||
                status === 'voided') && (
                <div className='mt-8 rounded-2xl border border-[#E6B5AE] bg-[#FFF5F2] px-5 py-4'>
                  <div className='flex items-start gap-3'>
                    <X className='mt-0.5 h-5 w-5 shrink-0 text-[#9A4B3F]' />

                    <div>
                      <div className='text-sm font-bold text-[#171512]'>
                        No se completó el pago
                      </div>

                      <p className='mt-1 text-sm leading-6 text-[#716C63]'>
                        Puedes regresar al catálogo y comenzar un
                        nuevo intento de compra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className='mt-8 rounded-2xl border border-[#E6B5AE] bg-[#FFF5F2] px-5 py-4'>
                  <div className='flex items-start gap-3'>
                    <X className='mt-0.5 h-5 w-5 shrink-0 text-[#9A4B3F]' />

                    <div>
                      <div className='text-sm font-bold text-[#171512]'>
                        No pudimos comprobar el estado
                      </div>

                      <p className='mt-1 text-sm leading-6 text-[#716C63]'>
                        El pago no debe considerarse fallido solo
                        porque la consulta haya encontrado un error.
                        Puedes volver a intentar la verificación.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error &&
                status !== 'error' && (
                  <div className='mt-4 text-sm text-[#8B443A]'>
                    {error}
                  </div>
                )}

              {/* Actions */}
              <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center'>
                {(status === 'declined' ||
                  status === 'voided' ||
                  status === 'error') && (
                  <button
                    type='button'
                    onClick={() =>
                      window.location.reload()
                    }
                    className='inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#D9D1C2] bg-white px-6 text-sm font-bold text-[#171512] transition hover:bg-[#F4F1EA]'
                  >
                    <RefreshCw className='h-4 w-4' />
                    Volver a verificar
                  </button>
                )}

                <Link
                  to='/catalog'
                  className='inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#171512] px-7 text-sm font-bold text-white transition hover:bg-[#D7A451] hover:text-[#171512]'
                >
                  <ShoppingBag className='h-4 w-4' />
                  Ver catálogo
                </Link>

                <Link
                  to='/'
                  className='inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#D9D1C2] bg-white px-6 text-sm font-bold text-[#4D4942] transition hover:bg-[#F4F1EA]'
                >
                  <Home className='h-4 w-4' />
                  Inicio
                </Link>
              </div>

              {/* Footer note */}
              <div className='mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#DDD5C8] pt-6 text-center text-xs text-[#858078] sm:flex-row sm:text-left'>
                <span>
                  Pago procesado mediante Wompi
                </span>

                <Link
                  to='/catalog'
                  className='inline-flex items-center gap-1.5 font-semibold text-[#8D6C39] transition hover:text-[#171512]'
                >
                  <ArrowLeft className='h-3.5 w-3.5' />
                  Volver a la colección
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
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
    <div className='rounded-2xl border border-[#D9D1C2] bg-white p-4'>
      <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9388]'>
        {label}
      </div>

      <div className='mt-2 break-all text-sm font-semibold text-[#171512]'>
        {value}
      </div>
    </div>
  )
}