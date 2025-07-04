import { useState } from 'react'
import { ModeToggle } from '../themes/mode-toggle'
import {
  Home,
  HeartHandshake,
  Users,
  Phone,
  LogIn,
  UserPlus,
  Menu,
  X,
  Activity,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section - Left */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#1A94E5] rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              HealthTech
            </span>
          </div>

          {/* Desktop Navigation Links - Center */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#1A94E5] dark:hover:text-[#1A94E5] transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a
              href="#services"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#1A94E5] dark:hover:text-[#1A94E5] transition-colors duration-200"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Services</span>
            </a>
            <a
              href="#about"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#1A94E5] dark:hover:text-[#1A94E5] transition-colors duration-200"
            >
              <Users className="w-4 h-4" />
              <span>About Us</span>
            </a>
            <a
              href="#contact"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#1A94E5] dark:hover:text-[#1A94E5] transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </div>

          {/* Auth Links & Theme Toggle - Right */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/auth-signin"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[#1A94E5] dark:hover:text-[#1A94E5] transition-colors duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
            <Link
              to="/auth-signup"
              className="flex items-center space-x-2 px-4 py-2 bg-[#1A94E5] text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-[#E8EDF2] dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <a
                href="#home"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-[#E8EDF2] dark:hover:bg-gray-800 hover:text-[#1A94E5] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </a>
              <a
                href="#services"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-[#E8EDF2] dark:hover:bg-gray-800 hover:text-[#1A94E5] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Services</span>
              </a>
              <a
                href="#about"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-[#E8EDF2] dark:hover:bg-gray-800 hover:text-[#1A94E5] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="w-5 h-5" />
                <span>About Us</span>
              </a>
              <a
                href="#contact"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-[#E8EDF2] dark:hover:bg-gray-800 hover:text-[#1A94E5] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Phone className="w-5 h-5" />
                <span>Contact</span>
              </a>

              {/* Mobile Auth Links */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <a
                  href="/login"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-[#E8EDF2] dark:hover:bg-gray-800 hover:text-[#1A94E5] transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </a>
                <a
                  href="/signup"
                  className="flex items-center space-x-3 px-3 py-2 mx-3 mt-2 bg-[#1A94E5] text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
