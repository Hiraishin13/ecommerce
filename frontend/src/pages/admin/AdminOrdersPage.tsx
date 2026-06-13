import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { orderService, type Order, type OrderStatus } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import OrderStatusBadge from '../account/components/OrderStatusBadge'
import DataTable, { type Column } from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import { cn } from '../../utils/cn'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderService.getOrders(page)
      let orders = res.orders ?? []
      if (statusFilter) {
        orders = orders.filter((o) => o.status === statusFilter)
      }
      setOrders(orders)
      setTotalPages(res.totalPages ?? 1)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { loadOrders() }, [loadOrders])

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      render: (row) => {
        const o = row as unknown as Order
        return <span className="text-xs font-bold">#{o.order_number}</span>
      },
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => {
        const o = row as unknown as Order
        return (
          <span className="text-xs text-muted">
            {new Date(o.created_at).toLocaleDateString('en-GB')}
          </span>
        )
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => {
        const o = row as unknown as Order
        return (
          <span className="text-xs">
            {o.shipping_address.first_name} {o.shipping_address.last_name}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const o = row as unknown as Order
        return <OrderStatusBadge status={o.status as OrderStatus} />
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => {
        const o = row as unknown as Order
        return <span className="text-xs font-bold">{formatPrice(o.total)}</span>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        const o = row as unknown as Order
        return (
          <Link
            to={`/admin/orders/${o.id}`}
            className="flex items-center gap-1 text-xs text-muted hover:text-black transition-colors"
          >
            View <ArrowRight size={12} />
          </Link>
        )
      },
    },
  ]

  return (
    <div>
      <h1 className="text-xl font-black uppercase tracking-wider mb-6">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex overflow-x-auto gap-1 mb-4 pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors',
              statusFilter === f.value
                ? 'bg-black text-white border-black'
                : 'border-accent hover:border-black'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No orders found."
      />

      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
