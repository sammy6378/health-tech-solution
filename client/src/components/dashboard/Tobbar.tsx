
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "../ui/sidebar"
import { ModeToggle } from "../themes/mode-toggle"
import { ShoppingCart } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useCartStore } from "@/store/cart/add"
import { useAuthStore } from "@/store/store"

function Tobbar() {
  const total = useCartStore((state) => state.cart.length)
  const {user} = useAuthStore()
  const role = user?.role;
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-white dark:bg-gray-900 backdrop-blur text-gray-900 dark:text-gray-100">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center space-x-4">
          {/* cart icon */}
          {role === 'patient' && (
            <Link
              to="/dashboard/cart"
              className="text-gray-500 relative hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="View Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {/* count */}
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-white bg-red-500 rounded-full">
                {total}
              </span>
            </Link>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default Tobbar