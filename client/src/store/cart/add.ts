import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type TMedication } from '@/types/api-types'

export interface CartItem extends TMedication {
  quantity: number
  total_price: number
}

interface CartStore {
  cart: CartItem[]
  addToCart: (item: TMedication, quantity?: number) => void
  removeFromCart: (medication_code: string) => void
  updateQuantity: (medication_code: string, quantity: number) => void
  clearCart: () => void
  totalAmount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item, quantity = 1) => {
        const existing = get().cart.find(
          (i) => i.medication_code === item.medication_code,
        )
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.medication_code === item.medication_code
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    total_price: (i.quantity + quantity) * i.unit_price,
                  }
                : i,
            ),
          })
        } else {
          set((state) => ({
            cart: [
              ...state.cart,
              {
                ...item,
                quantity,
                total_price: quantity * item.unit_price,
              },
            ],
          }))
        }
      },

      removeFromCart: (code) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.medication_code !== code),
        })),

      updateQuantity: (code, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.medication_code === code
              ? {
                  ...item,
                  quantity: quantity,
                  total_price: quantity * item.unit_price,
                }
              : item,
          ),
        })),

      clearCart: () => set({ cart: [] }),

      totalAmount: () =>
        get().cart.reduce((sum, item) => sum + item.total_price, 0),
    }),
    {
      name: 'cart-storage', // unique name for the storage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      // Optional: you can also use sessionStorage
      // storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
