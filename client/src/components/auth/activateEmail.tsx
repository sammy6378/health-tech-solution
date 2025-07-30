import { useState, useEffect, useRef } from 'react'
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useActivateAccount } from '@/hooks/useAuthHook'
import { useContextFunc } from '@/components/context/authContext'
import AuthLayout from './authLayout'

function ActivateEmail() {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const activateAccount = useActivateAccount()
  const { activationToken } = useContextFunc()

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [timeLeft])

  // Redirect if no activation token
  if (!activationToken) {
    return (
      <AuthLayout>
        <div className="w-full md:w-1/2 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Activation Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please register first to receive an activation code.
            </p>
            <Link
              to="/auth-signup"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Registration
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  const handleDigitChange = (index: number, value: string) => {
    // Allow only single digits
    if (value !== '' && !/^\d$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    setError('')

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text/plain').trim()

    if (/^\d{4}$/.test(pasteData)) {
      const newDigits = pasteData.split('')
      setDigits(newDigits.slice(0, 4))
      inputRefs[3].current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const code = digits.join('')
    if (code.length !== 4) {
      setError('Please enter a complete 4-digit code')
      triggerShake()
      return
    }

    try {
      await activateAccount.mutateAsync({ activation_code: code })
    } catch (error) {
      triggerShake()
    }
  }

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <AuthLayout>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <div className="w-full md:w-1/2 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Activate Your Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a 4-digit code to your email address.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Expires in:{' '}
              <span className="font-mono font-semibold text-red-500">
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Activation Code
              </label>
              <div
                className={`flex gap-3 justify-center ${isShaking ? 'animate-shake' : ''}`}
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all"
                    maxLength={1}
                  />
                ))}
              </div>
              {error && (
                <div className="flex items-center justify-center mt-3 text-red-500 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={activateAccount.isPending || timeLeft <= 0}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {activateAccount.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Activating...
                </>
              ) : (
                'Activate Account'
              )}
            </button>
          </form>

          {/* <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={() => {
                // You can implement resend functionality here
                console.log('Resend activation code')
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold text-sm transition-colors"
            >
              Resend Code
            </button>
          </div> */}
        </div>
      </div>
    </AuthLayout>
  )
}

export default ActivateEmail
