import { format } from 'date-fns'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart/add'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCartStore()
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>(
    'pickup',
  )

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Medication Cart
          </h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
            {cart.length} items
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">{/* empty cart */}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.medication_id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-40 h-40 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                      {item.prescription_required && (
                        <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                          Rx Only
                        </span>
                      )}
                    </div>

                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                            {item.name}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.dosage}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                              {item.medication_type}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                              {item.category}
                            </span>
                            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-amber-900 dark:text-amber-300">
                              Exp: {format(item.expiration_date, 'MMM yyyy')}
                            </span>
                          </div>
                        </div>

                        <button
                          className="text-gray-400 cursor-pointer hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                          onClick={() => removeFromCart(item.medication_code)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg w-fit">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.medication_code,
                                Math.max(item.quantity - 1, 1),
                              )
                            }
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 text-gray-800 dark:text-white font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.medication_code,
                                item.quantity + 1,
                              )
                            }
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            KES {item.unit_price} each
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            KES {item.total_price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      KES {totalAmount()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="text-gray-800 dark:text-white">KES 0</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-800 dark:text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    KES {totalAmount()}
                  </span>
                </div>

                {/* order delivery */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Delivery
                  </h3>
                  <div>
                  <Button
                    variant={deliveryMethod === 'home' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setDeliveryMethod('home')}
                  >
                    Home Delivery
                  </Button>
                  <Button
                    variant={deliveryMethod === 'pickup' ? 'default' : 'outline'}
                    className="ml-2 cursor-pointer"
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    Pickup
                  </Button>
                  </div>
                </div>

                <Link
                  to={deliveryMethod === 'home' ? '/dashboard/cart/new-order' : '/dashboard/cart'}
                  className={
                    `block w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition text-center`}
                >
                  {deliveryMethod === 'home' ? 'Create Order' : 'Checkout'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
