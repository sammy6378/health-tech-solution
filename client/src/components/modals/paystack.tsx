import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

// Extend the Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop?: any
  }
}

type PaystackModalProps = {
  email: string
  amount: number
  reference: string
  currency?: string
  onSuccess?: (reference: string) => void
  onClose?: () => void
  autoTrigger?: boolean // if true, open immediately
}

export default function PaystackModal({
  email,
  amount,
  reference,
  currency = 'KES',
  onSuccess,
  onClose,
  autoTrigger = true,
}: PaystackModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if script already exists and PaystackPop is available
    if (window.PaystackPop) {
      setScriptLoaded(true)
      return
    }

    // Inject the Paystack script if it's not already present
    if (!document.getElementById('paystack-script')) {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      script.id = 'paystack-script'

      script.onload = () => {
        console.log('Paystack script loaded successfully')
        setScriptLoaded(true)
      }

      script.onerror = () => {
        console.error('Failed to load Paystack script')
        toast({
          title: 'Failed to load payment gateway',
          description: 'Please try again later.',
          variant: 'destructive',
        })
      }

      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    if (
      autoTrigger &&
      scriptLoaded &&
      window.PaystackPop &&
      reference &&
      email &&
      amount
    ) {
      console.log('Initializing Paystack payment with:', {
        email,
        amount: amount * 100,
        reference,
        currency,
      })

      try {
        const handler = window.PaystackPop.setup({
          key:
            import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
            'pk_test_9c7cb667be19893bb131624008c263884493bda2',
          email,
          amount: amount * 100, // Paystack expects amount in kobo/cents
          currency,
          ref: reference,
          callback: function (response: any) {
            console.log('Payment successful:', response)
            toast({
              title: 'Payment successful',
              description: `Your payment was successful. Reference: ${response.reference}`,
              variant: 'success',
            })
            onSuccess?.(response.reference)
          },
          onClose: function () {
            console.log('Payment window closed')
            toast({
              title: 'Payment window closed',
              description: 'You closed the payment window before completing the transaction.',
              variant: 'info',
            })
            onClose?.()
          },
        })

        // Add a small delay to ensure everything is ready
        setTimeout(() => {
          handler.openIframe()
        }, 100)
      } catch (error) {
        console.error('Error initializing Paystack:', error)
        toast({
          title: 'Payment initialization failed',
          description: 'There was an error initializing the payment gateway. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }, [
    autoTrigger,
    scriptLoaded,
    reference,
    email,
    amount,
    currency,
    onSuccess,
    onClose,
  ])

  // Add some debug logging
  useEffect(() => {
    console.log('PaystackModal state:', {
      autoTrigger,
      scriptLoaded,
      hasPaystackPop: !!window.PaystackPop,
      reference,
      email,
      amount,
    })
  }, [autoTrigger, scriptLoaded, reference, email, amount])

  return null // no UI, just triggers Paystack when rendered
}
