'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { useUserData } from '@/hooks/useDashboard'
import type { TUser } from '@/types/Tuser'
import { useToast } from '@/hooks/use-toast'

const PER_PAGE = 10

function ManageUsers() {
    const {patients} = useUserData()
    const { toast } = useToast()
  const [users, setUsers] = useState<TUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
   const [searchTerm, setSearchTerm] = useState('')
   const [createdAtFilter, setCreatedAtFilter] = useState('all')

  console.log("patients", users)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        // Filter by search
        let filtered = patients
        if (searchTerm.trim()) {
          filtered = filtered.filter(
            (u) =>
              `${u.first_name} ${u.last_name}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        }
        // Filter by created at
        if (createdAtFilter !== 'all') {
          const now = new Date()
          filtered = filtered.filter((u) => {
            const created = u.created_at ? new Date(u.created_at) : null
            if (!created) return false
            if (createdAtFilter === 'today') {
              return (
                created.getDate() === now.getDate() &&
                created.getMonth() === now.getMonth() &&
                created.getFullYear() === now.getFullYear()
              )
            }
          
            if (createdAtFilter === 'this_week') {
              const weekStart = new Date(now)
              weekStart.setDate(now.getDate() - now.getDay())
              weekStart.setHours(0, 0, 0, 0)
              const weekEnd = new Date(weekStart)
              weekEnd.setDate(weekStart.getDate() + 7)
              return created >= weekStart && created < weekEnd
            }
            if (createdAtFilter === 'this_month') {
              return (
                created.getMonth() === now.getMonth() &&
                created.getFullYear() === now.getFullYear()
              )
            }
            return true
          })
        }
        setTotalUsers(filtered.length)
          const users = patients.slice(
            (currentPage - 1) * PER_PAGE,
            currentPage * PER_PAGE,
          )
        setUsers(users)
        setTotalUsers(patients.length)
      } catch (err) {
        toast({
          title: 'Error fetching users',
          description: 'There was an error loading the users. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [patients, currentPage, searchTerm, createdAtFilter])

  const handleDelete = async (userId?: string) => {
    if (!userId) return
    const confirm = window.confirm('Are you sure you want to delete this user?')
    if (!confirm) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      toast({
        title: 'User deleted',
        description: 'The user has been successfully deleted.',
        variant: 'success',
      })
      setUsers(users.filter((user) => user.user_id !== userId))
    } catch {
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const totalPages = Math.ceil(totalUsers / PER_PAGE)

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">👥 Manage Users</h2>
      <Separator />

      <div className="flex flex-col md:flex-row gap-2 md:items-center mb-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <select
          value={createdAtFilter}
          onChange={(e) => {
            setCreatedAtFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="border rounded px-3 py-2 w-full md:w-48 dark:bg-gray-800 dark:border-gray-700"
        >
          <option
            value="all"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            All Created Dates
          </option>
          <option
            value="today"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Created Today
          </option>
          <option
            value="this_week"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Created This Week
          </option>
          <option
            value="this_month"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Created This Month
          </option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <div className="overflow-auto rounded-md border shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.created_at ?? '').toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => handleDelete(user.user_id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
