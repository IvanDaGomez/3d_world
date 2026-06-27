import { useInView, motion } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40
  },

  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1]
    }
  })
}

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
