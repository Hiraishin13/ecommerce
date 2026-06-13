import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import DataTable, { type Column } from '../../components/ui/DataTable'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import { useDebounce } from '../../hooks/useDebounce'
import api from '../../services/api'

interface Customer {
  id: number
  name: string
  email: string
  role: string
  orders_count: number
  created_at: string
}

interface PaginatedCustomers {
  data: Customer[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    setLoading(true)
    api
      .get<PaginatedCustomers>('/admin/users', {
        params: { page, search: debouncedSearch || undefined },
      })
      .then((res) => {
        // After interceptor unwrap: res.data = { users, total, pagination }
        setCustomers(res.data.users ?? [])
        setTotalPages(res.data.pagination?.total_pages ?? 1)
        setTotal(res.data.total ?? 0)
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch])

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => {
        const c = row as unknown as Customer
        return (
          <div>
            <p className="text-xs font-bold">{c.name}</p>
            <p className="text-xs text-muted">{c.email}</p>
          </div>
        )
      },
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => {
        const c = row as unknown as Customer
        return (
          <span className="text-xs uppercase tracking-wider">{c.role}</span>
        )
      },
    },
    {
      key: 'orders_count',
      label: 'Orders',
      render: (row) => {
        const c = row as unknown as Customer
        return <span className="text-xs font-bold">{c.orders_count ?? 0}</span>
      },
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (row) => {
        const c = row as unknown as Customer
        return (
          <span className="text-xs text-muted">
            {new Date(c.created_at).toLocaleDateString('en-GB')}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">
          Customers {!loading && <span className="text-muted text-base">({total})</span>}
        </h1>
      </div>

      <div className="mb-4 max-w-xs">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          icon={<Search size={14} />}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No customers found."
      />

      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
