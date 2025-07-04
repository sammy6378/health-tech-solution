
import { motion } from 'framer-motion'
import {
  Shield,
  Heart,
  Users,
  Award,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { cardVariants, containerVariants, itemVariants } from '../variants/motion'

function About() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        'Your health data is protected with enterprise-grade security and HIPAA compliance.',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description:
        'We put patients at the heart of everything we do, ensuring personalized healthcare experiences.',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      icon: Users,
      title: 'Expert Network',
      description:
        'Connect with certified healthcare professionals and specialists in your area.',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description:
        'All our healthcare providers are verified and maintain the highest standards of care.',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ]

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To revolutionize healthcare delivery by creating seamless connections between patients, doctors, and pharmacies through innovative technology.',
    },
    {
      icon: Lightbulb,
      title: 'Our Vision',
      description:
        'A world where quality healthcare is accessible, affordable, and convenient for everyone, regardless of location or background.',
    },
  ]

  const achievements = [
    'HIPAA Compliant Platform',
    '24/7 Customer Support',
    '99.9% Uptime Guarantee',
    'Multilingual Support',
    'Mobile-First Design',
    'AI-Powered Recommendations',
  ]

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
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
              <Users className="w-5 h-5 text-[#1A94E5]" />
              <span className="text-sm font-medium text-[#1A94E5]">
                About Us
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Transforming Healthcare
              <span className="block text-[#1A94E5]">Through Innovation</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              HealthTech is dedicated to bridging the gap between patients and
              healthcare providers through cutting-edge technology, ensuring
              everyone has access to quality medical care when they need it
              most.
            </p>
          </motion.div>

          {/* Mission & Vision */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-8 mb-20"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={cardVariants}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A94E5]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1A94E5]/10 dark:bg-[#1A94E5]/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-[#1A94E5]" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {value.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>

                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#1A94E5]/20 transition-all duration-300"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose HealthTech?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We combine advanced technology with human care to deliver
                exceptional healthcare experiences.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h4>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Commitments
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We're committed to providing the highest quality healthcare
                technology solutions.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 p-3 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {achievement}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-[#1A94E5] text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
