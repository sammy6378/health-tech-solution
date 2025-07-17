import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'

interface PaginationProps {
  currentPage: number
  totalCount: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
  rowsPerPageOptions?: number[]
}

export const Pagination = ({
  currentPage,
  totalCount,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}: PaginationProps) => {
  const totalPages = Math.ceil(totalCount / rowsPerPage)

  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalCount)

  // Filter out invalid values more thoroughly
  const validRowsPerPageOptions = rowsPerPageOptions
    .filter((option) => option && option > 0 && Number.isInteger(option))
    .sort((a, b) => a - b)

  // Ensure we have at least one valid option
  const safeRowsPerPageOptions =
    validRowsPerPageOptions.length > 0
      ? validRowsPerPageOptions
      : [5, 10, 25, 50]

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <Select
          value={String(rowsPerPage || safeRowsPerPageOptions[0])}
          onValueChange={(val) => onRowsPerPageChange(Number(val))}
        >
          <SelectTrigger className="w-[80px] bg-white dark:bg-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            {safeRowsPerPageOptions.map((option) => (
              <SelectItem
                key={option}
                value={String(option)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <span>
          {startItem}–{endItem} of {totalCount}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
