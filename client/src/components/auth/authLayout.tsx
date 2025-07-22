import { type ReactNode } from 'react';

const AuthLayout = ({ children }:{children: ReactNode})  =>{
  return (
    // right side of the form
    <div className="flex h-screen">
      <div className="w-1/2 relative hidden md:flex flex-col justify-center items-center p-8">
        <img
          src="/auth.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* left side of the form */}

      {children}
    </div>
  )
}

export default AuthLayout