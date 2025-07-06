import React from 'react'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1A94E5] to-blue-700 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Image Container */}
        <div className="relative z-10 flex items-center justify-center w-full p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-lg w-full"
          >
            <img
              src="/login-img.png"
              alt="Healthcare illustration"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Welcome to HealthTech</h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Your trusted healthcare companion. Connect with doctors, manage
              appointments, and access quality medical care anytime, anywhere.
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-10 right-10 w-16 h-16 border-4 border-white/20 rounded-full"
        />

        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-10 w-8 h-8 bg-white/10 rounded-full"
        />
      </motion.div>

      {/* Right side - Auth Forms */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative"
      >
        {/* Background for mobile */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-[#1A94E5]/10 to-blue-700/10" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-md px-6 py-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Header - only visible on small screens */}
        <div className="lg:hidden absolute top-8 left-6 right-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              HealthTech
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your healthcare journey starts here
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements for Right Side */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-10 right-10 w-12 h-12 bg-[#1A94E5]/5 rounded-full hidden lg:block"
        />
      </motion.div>
    </div>
  )
}

export default AuthLayout
