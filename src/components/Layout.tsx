import { Outlet } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
// import Footer from '@/components/Footer'

export default function Layout () {
  const [isNavHidden, setIsNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY.current

      if (Math.abs(delta) > 4) {
        setIsNavHidden(delta > 0)
      }

      if (currentScrollY < 10) {
        setIsNavHidden(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='relative min-h-screen w-full flex flex-col'>
      {/* Header */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isNavHidden ? -80 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className='z-10000 w-full'
      >
        <Header />
      </motion.div>

      {/* Main content */}
      <main className='relative flex-1 w-full'>
        <Outlet />
      </main>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  )
}
