
import { easeOut } from 'framer-motion'

export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
      duration: 0.3,
    },
  },
}

export const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: easeOut,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
}



export const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}
