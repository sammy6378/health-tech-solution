
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Users,
  Star,
  Stethoscope,
  Heart,
  Activity,
} from 'lucide-react'
import { buttonVariants, containerVariants, itemVariants } from '../variants/motion'

function Hero() {
  const stats = [
    {
      icon: Users,
      label: 'Recovered Patients',
      value: '750+',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Star,
      label: 'Satisfaction Rate',
      value: '94%',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      icon: Stethoscope,
      label: 'Expert Doctors',
      value: '86+',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 opacity-90 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-[-1]"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/0e/3c/05/0e3c0532640f7be06f9d2966ec0a0bc3.jpg')",
        }}
      ></div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-[#1A94E5]/10 rounded-full blur-xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trusted Healthcare Platform
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Your Health.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A94E5] to-emerald-400">
                Your Wealth.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Connecting patients, doctors, and pharmacies for seamless
              healthcare. Experience the future of medical care with our
              comprehensive platform.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="group relative px-8 py-4 bg-[#1A94E5] text-white rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Explore Our Services</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A94E5] to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              <span className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </span>
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover="hover"
                className="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 text-center space-y-4">
                  {/* Icon */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </motion.div>

                  {/* Value */}
                  <motion.div
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.div>

                  {/* Label */}
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#1A94E5]/20 transition-all duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
