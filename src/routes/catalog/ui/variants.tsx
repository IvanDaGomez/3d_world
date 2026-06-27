import { type Variants } from 'framer-motion'

export const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      // El "as const" soluciona el error de Type 'number[]' is not assignable to type 'Easing'
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

export const stagger: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
}
export const fadeUp: Variants = {
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
