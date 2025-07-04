import { motion } from 'framer-motion'
import {
  Calendar,
  Pill,
  UserCheck,
  FileText,
  Video,
  Clock,
  MapPin,
  Shield,
  Smartphone,
  HeartHandshake,
  Stethoscope,
  Users,
} from 'lucide-react'
import {
  containerVariants,
  cardVariants,
  itemVariants,
  buttonVariants,
} from '../variants/motion'

function Services() {
  const mainServices = [
    {
      icon: Calendar,
      title: 'Online Appointments',
      description:
        'Book appointments with healthcare providers instantly. Choose your preferred time and get confirmed bookings instantly.',
      features: [
        '24/7 Booking',
        'Instant Confirmation',
        'Reminder Notifications',
      ],
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Pill,
      title: 'Pharmacy Services',
      description:
        'Order prescriptions online and get them delivered to your doorstep. Track your medication history and get refill reminders.',
      features: [
        'Home Delivery',
        'Prescription Tracking',
        'Medication Reminders',
      ],
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: UserCheck,
      title: 'Doctor Consultations',
      description:
        'Connect with certified doctors for consultations. Get expert medical advice from the comfort of your home.',
      features: ['Certified Doctors', 'Video Consultations', 'Medical Records'],
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  const additionalServices = [
    {
      icon: Video,
      title: 'Telemedicine',
      description: 'Virtual consultations with healthcare professionals',
    },
    {
      icon: FileText,
      title: 'Medical Records',
      description: 'Secure digital storage of your health information',
    },
    {
      icon: Clock,
      title: 'Emergency Care',
      description: '24/7 emergency medical assistance and support',
    },
    {
      icon: MapPin,
      title: 'Location Services',
      description: 'Find nearby healthcare facilities and pharmacies',
    },
    {
      icon: Shield,
      title: 'Health Insurance',
      description: 'Insurance verification and claim processing',
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Access all services through our mobile application',
    },
  ]

  const processSteps = [
    {
      step: '01',
      title: 'Register',
      description: 'Create your account and complete your health profile',
      icon: Users,
    },
    {
      step: '02',
      title: 'Choose Service',
      description: 'Select from our range of healthcare services',
      icon: HeartHandshake,
    },
    {
      step: '03',
      title: 'Get Care',
      description: 'Receive quality healthcare from certified professionals',
      icon: Stethoscope,
    },
  ]

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#1A94E5]/10 dark:bg-[#1A94E5]/20 px-4 py-2 rounded-full mb-4">
              <HeartHandshake className="w-5 h-5 text-[#1A94E5]" />
              <span className="text-sm font-medium text-[#1A94E5]">
                Our Services
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Healthcare
              <span className="block text-[#1A94E5]">Solutions</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From online consultations to prescription delivery, we provide a
              complete healthcare ecosystem designed to make medical care
              accessible and convenient.
            </p>
          </motion.div>

          {/* Main Services */}
          <motion.div
            variants={itemVariants}
            className="grid lg:grid-cols-3 gap-8 mb-20"
          >
            {mainServices.map((service) => (
              <motion.div
                key={service.title}
                variants={cardVariants}
                className="group relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A94E5]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${service.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#1A94E5] rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full px-6 py-3 bg-[#1A94E5] text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-300"
                  >
                    Learn More
                  </motion.button>
                </div>

                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#1A94E5]/20 transition-all duration-300"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Services Grid */}
          <motion.div variants={itemVariants} className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Additional Features
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore our comprehensive range of healthcare features designed
                to support your wellness journey.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service) => (
                <motion.div
                  key={service.title}
                  variants={cardVariants}
                  className="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-[#E8EDF2] dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-[#1A94E5]/10 transition-colors duration-300">
                        <service.icon className="w-6 h-6 text-[#1A94E5]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Getting started with HealthTech is simple. Follow these three
                easy steps to access quality healthcare.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative flex flex-col items-center text-center px-2"
                >
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1A94E5] text-white rounded-full text-xl font-bold mb-4 z-10">
                    {step.step}
                  </div>

                  {/* Connector Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-[-50%] w-[100%] h-0.5 bg-gradient-to-r from-[#1A94E5] to-transparent z-0"></div>
                  )}

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E8EDF2] dark:bg-gray-800 rounded-lg mb-4">
                    <step.icon className="w-6 h-6 text-[#1A94E5]" />
                  </div>

                  {/* Content */}
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-[#1A94E5] text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Get Started Today</span>
                <Calendar className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Services
