
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "../ui/sidebar"
import { ModeToggle } from "../themes/mode-toggle"

function Tobbar() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-gray-50 dark:bg-gray-900 backdrop-blur text-gray-900 dark:text-gray-100">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default Tobbar