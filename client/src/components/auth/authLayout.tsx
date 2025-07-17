import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { type ReactNode } from 'react';

const AuthLayout = ({ children }:{children: ReactNode})  =>{
  return (
    // right side of the form
    <div className="flex h-screen dark:bg-gray-900">
      <div className="w-1/2 relative hidden md:flex flex-col justify-center items-center dark:bg-gray-900 dark:text-white p-8">
        <img
          src="/auth.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-4">MediConnect</h2>
          <p className="mb-6">
            Welcome to MediConnect. We provide the best telemedicine services
            with a wide range of Health services. MediConnect is your one-stop
            solution for all your health needs.
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <a href="https://facebook.com" className="text-blue-500">
              <FaFacebook size={30} />
            </a>
            <a href="https://instagram.com" className="text-pink-500">
              <FaInstagram size={30} />
            </a>
            <a href="https://youtube.com" className="text-red-600">
              <FaYoutube size={30} />
            </a>
            <a href="https://twitter.com" className="text-blue-400">
              <FaTwitter size={30} />
            </a>
          </div>
        </div>
      </div>

      {/* right side of the form */}

      {children}
    </div>
  )
}

export default AuthLayout