import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound () {
  return (
    <div className='min-h-screen flex items-center justify-center bg-[#08101F] px-6'>
      <div className='text-center max-w-2xl'>
        {/* Código de error con estilo sutil */}
        <h1 className='text-9xl font-black mb-8' style={{ color: '#111C38' }}>
          404
        </h1>

        <h2
          className='text-4xl lg:text-5xl font-bold mb-6'
          style={{ color: '#E2E8F5', fontFamily: 'var(--font-display)' }}
        >
          Página no encontrada
        </h2>

        <p className='text-lg mb-12' style={{ color: '#748BB4' }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
          Regresemos a un lugar seguro.
        </p>

        <Link
          to='/'
          className='
            inline-flex
            items-center
            gap-3
            px-8
            h-14
            rounded-xl
            font-semibold
            transition-transform
            hover:scale-105
          '
          style={{
            background: '#1E4FD8',
            color: 'white'
          }}
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
