import { useInView, motion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp } from '../ui/variants'

export default function Reveal ({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const inView = useInView(ref, {
    once: true,
    margin: '-80px'
  })

  return (
    <motion.div
      ref={ref}
      className={className}
      custom={delay}
      variants={fadeUp}
      initial='hidden'
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}
