import { BRAND_NAME, PHONE_NUMBER } from '@/utils/config'

export default function Footer () {
  const WA_HREF = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
    `Hola, me gustaría obtener más información sobre sus productos.`
  )}`
  return (
    <footer
      className='border-t border-[#0F1A30] px-6 py-8'
      style={{ background: '#04060C' }}
    >
      <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Brand */}
        <div className='flex items-center gap-2.5'>
          <div
            className='w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0'
            aria-hidden='true'
          >
            <img src='/logo.png' alt='' className='w-8' />
          </div>
          <span
            className='text-sm font-semibold text-white'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {BRAND_NAME}
          </span>
        </div>

        <a
          href={WA_HREF}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs transition-colors duration-150 hover:text-[#5C8AFF]'
          style={{ color: '#2D3F60' }}
        >
          WhatsApp →
        </a>
      </div>
    </footer>
  )
}
