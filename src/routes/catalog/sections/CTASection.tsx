import { ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal'
import SectionLabel from '../components/SectionLabel'
import { motion } from 'framer-motion'
import { PHONE_NUMBER } from '@/utils/config'

export default function CTASection () {
  const handleProductClick = () => {
    const message =
      '¡Hola! Estoy interesado en sus productos y me gustaría obtener más información.'
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }
  return (
    <section className='pb-32'>
      <Reveal>
        <div className='max-w-7xl mx-auto px-6'>
          <div
            className='
                relative
                overflow-hidden
                rounded-[42px]
                px-10
                py-24
                lg:px-20
                text-center
              '
            style={{
              background: 'linear-gradient(145deg,#08101F,#111C38)',
              border: '1px solid #203866'
            }}
          >
            {/* Glow */}

            <div
              className='
                  absolute
                  left-1/2
                  top-0
                  -translate-x-1/2
                  w-[900px]
                  h-[500px]
                  rounded-full
                  blur-3xl
                  opacity-20
                '
              style={{
                background: '#1E4FD8'
              }}
            />

            <div className='relative z-10'>
              <SectionLabel>CONSTRUYAMOS ALGO</SectionLabel>

              <h2
                className='
                    text-5xl
                    lg:text-6xl
                    font-black
                    leading-tight
                    max-w-4xl
                    mx-auto
                  '
                style={{
                  color: '#E2E8F5',
                  fontFamily: 'var(--font-display)'
                }}
              >
                Tu próximo producto comienza con una
                <span
                  style={{
                    color: '#1E4FD8'
                  }}
                >
                  {' '}
                  idea.
                </span>
              </h2>

              <p
                className='
                    max-w-2xl
                    mx-auto
                    mt-8
                    text-lg
                    leading-8
                  '
                style={{
                  color: '#748BB4'
                }}
              >
                Ya sea que necesites un regalo personalizado o miles de
                productos corporativos, estamos listos para fabricarlo con
                calidad premium.
              </p>

              <div
                className='
                    flex
                    flex-wrap
                    justify-center
                    gap-5
                    mt-12
                  '
              >
                <motion.div
                  whileHover={{
                    scale: 1.04
                  }}
                  whileTap={{
                    scale: 0.97
                  }}
                >
                  <motion.button
                    onClick={() => handleProductClick()}
                    className='
                        inline-flex
                        items-center
                        gap-3
                        px-8
                        h-14
                        rounded-xl
                        font-semibold
                      '
                    style={{
                      background: '#1E4FD8',
                      color: 'white'
                    }}
                  >
                    Comienza tu proyecto
                    <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
