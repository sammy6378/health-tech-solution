
import { motion } from 'framer-motion'
import {
  Activity,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  ArrowUp,
  Calendar,
  Pill,
  UserCheck,
  Shield,
} from 'lucide-react'
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from '../variants/motion'

function Footer() {
  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ]

  const services = [
    { name: 'Online Appointments', href: '#', icon: Calendar },
    { name: 'Pharmacy Services', href: '#', icon: Pill },
    { name: 'Doctor Consultations', href: '#', icon: UserCheck },
    { name: 'Health Insurance', href: '#', icon: Shield },
  ]

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: '#',
      color: 'hover:text-blue-600',
    },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-500' },
    {
      name: 'Instagram',
      icon: Instagram,
      href: '#',
      color: 'hover:text-pink-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: '#',
      color: 'hover:text-blue-700',
    },
  ]

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@healthtech.com',
      href: 'mailto:info@healthtech.com',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: '123 Healthcare St, Medical City, MC 12345',
      href: '#',
    },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="pt-16 pb-8"
        >
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-[#1A94E5] rounded-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold">HealthTech</span>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Transforming healthcare through innovation. We connect patients,
                doctors, and pharmacies to provide seamless, accessible medical
                care for everyone.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:bg-gray-700`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#1A94E5] transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-[#1A94E5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Our Services
              </h3>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <a
                      href={service.href}
                      className="text-gray-400 hover:text-[#1A94E5] transition-colors duration-300 flex items-center space-x-3 group"
                    >
                      <service.icon className="w-4 h-4 text-[#1A94E5] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                      <span>{service.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Get In Touch
              </h3>
              <div className="space-y-4">
                {contactInfo.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    className="flex items-start space-x-3 text-gray-400 hover:text-[#1A94E5] transition-colors duration-300 group"
                  >
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                      <contact.icon className="w-5 h-5 text-[#1A94E5] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {contact.label}
                      </p>
                      <p className="text-sm">{contact.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Stay Updated
                </h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1A94E5] transition-colors duration-300"
                  />
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-4 py-2 bg-[#1A94E5] text-white rounded-r-lg hover:bg-blue-600 transition-colors duration-300"
                  >
                    <Mail className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="border-t border-gray-800 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>© 2024 HealthTech. Made with</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>for better healthcare.</span>
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-6 text-sm">
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#1A94E5] transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#1A94E5] transition-colors duration-300"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#1A94E5] transition-colors duration-300"
                >
                  HIPAA Compliance
                </a>
              </div>

              {/* Scroll to Top */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={scrollToTop}
                className="w-10 h-10 bg-[#1A94E5] text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A94E5] to-transparent"></div>
    </footer>
  )
}

export default Footer
