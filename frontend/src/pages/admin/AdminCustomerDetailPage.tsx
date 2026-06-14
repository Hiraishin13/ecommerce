import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Calendar, ShoppingCart, Shield } from 'lucide-react'
import { m } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { formatPrice } from '../../utils/formatPrice'
import { stagger, staggerItem } from '../../utils/motion'
import OrderStatusBadge from '../account/components/OrderStatusBadge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

interface CustomerDetail {
  id:           number
  name:         string
  email:        string
  role:         string
  created_at:   string
  recent_orders: RecentOrder[]
}

interface RecentOrder {
  id:           number
  order_number: string
  status:       string
  total_amount: number
  created_at:   string
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer]   = useState<CustomerDetail | null>(null)
  const [loading, setLoading]     = useState(true)
  const [changing, setChanging]   = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get(`/admin/users/${id}`)
      .then((res) => setCustomer(res.data?.user ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleRoleToggle = async () => {
    if (!customer) return
    const newRole = customer.role === 'admin' ? 'customer' : 'admin'
    if (!confirm(`Change role to "${newRole}"?`)) return
    setChanging(true)
    try {
      await api.patch(`/admin/users/${customer.id}/role`, { role: newRole })
      setCustomer((prev) => prev ? { ...prev, role: newRole } : prev)
      toast.success('Role updated')
    } catch {
      toast.error('Failed to change role')
    } finally {
      setChanging(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return
    if (!confirm(`Permanently delete "${customer.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${customer.id}`)
      toast.success('Customer deleted')
      window.history.back()
    } catch {
      toast.error('Failed to delete customer')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted mb-4">Customer not found.</p>
        <Link to="/admin/customers"><Button variant="secondary">Back to Customers</Button></Link>
      </div>
    )
  }

  const totalSpent = (customer.recent_orders ?? [])
    .filter((o) => !['cancelled', 'refunded'].includes(o.status))
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/customers" className="p-1 hover:bg-accent transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wider">Customer Detail</h1>
      </div>

      <m.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={stagger(0.06)}
        initial="hidden"
        animate="visible"
      >
        {/* Profile card */}
        <m.div variants={staggerItem} className="md:col-span-1 border border-accent p-5 space-y-4">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-2xl font-black">
            {customer.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-base font-black">{customer.name}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${customer.role === 'admin' ? 'bg-black text-white' : 'bg-accent text-black'}`}>
              {customer.role}
            </span>
          </div>

          <div className="space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Mail size={12} />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              <span>Joined {new Date(customer.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart size={12} />
              <span>{(customer.recent_orders ?? []).length} orders</span>
            </div>
          </div>

          <div className="pt-2 border-t border-accent">
            <p className="text-xs text-muted uppercase tracking-wider mb-0.5">Total Spent</p>
            <p className="text-lg font-black">{formatPrice(totalSpent)}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-accent">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRoleToggle}
              loading={changing}
              className="w-full"
            >
              <Shield size={12} />
              {customer.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              loading={deleting}
              className="w-full !text-[#D32F2F] hover:!bg-red-50"
            >
              Delete Account
            </Button>
          </div>
        </m.div>

        {/* Orders */}
        <m.div variants={staggerItem} className="md:col-span-2">
          <h2 className="text-xs font-black uppercase tracking-wider mb-3">Recent Orders</h2>
          {(customer.recent_orders ?? []).length === 0 ? (
            <div className="border border-accent p-8 text-center">
              <p className="text-xs text-muted uppercase tracking-wider">No orders yet</p>
            </div>
          ) : (
            <div className="border border-accent overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black text-white text-xs">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Order</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {customer.recent_orders.map((order) => (
                    <tr key={order.id} className="border-t border-accent hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 font-bold text-xs">#{order.order_number ?? order.id}</td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status as never} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-xs">
                        {formatPrice(order.total_amount ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-xs text-muted hover:text-black transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </m.div>
      </m.div>
    </div>
  )
}
