import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Package, Users, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

interface TenantDetail {
  id: number
  name: string
  slug: string
  status: string
  sector: string
  domain: string | null
  owner_email: string
  owner_name: string
  plan_name: string
  plan_slug: string
  sub_status: string
  current_period_end: string
  limits: Record<string, number>
  features: Record<string, boolean>
  created_at: string
}

interface Usage {
  products: number
  orders: number
  users: number
  revenue: number
}

interface MonthlyOrder { m: string; cnt: number; rev: string }

interface Invoice {
  id: number
  invoice_number: string
  status: string
  amount: string
  currency: string
  period_start: string
  period_end: string
  paid_at: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-green-700 bg-green-50',
  trial:     'text-blue-700 bg-blue-50',
  suspended: 'text-red-700 bg-red-50',
  cancelled: 'text-gray-500 bg-gray-100',
  paid:      'text-green-700 bg-green-50',
  open:      'text-yellow-700 bg-yellow-50',
  void:      'text-gray-500 bg-gray-100',
}

export default function SuperAdminTenantDetailPage() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const [detail, setDetail]   = useState<{ tenant: TenantDetail; usage: Usage; monthly_orders: MonthlyOrder[] } | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'overview' | 'invoices' | 'features'>('overview')
  const [planId, setPlanId]     = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/superadmin/stats/tenant/${id}`),
      api.get(`/superadmin/tenants/${id}/invoices`),
    ]).then(([statsRes, invRes]) => {
      setDetail(statsRes.data)
      setInvoices(invRes.data.invoices ?? [])
    }).catch(() => toast.error('Failed to load tenant'))
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/superadmin/tenants/${id}/status`, { status })
      toast.success('Status updated')
      const r = await api.get(`/superadmin/stats/tenant/${id}`)
      setDetail(r.data)
    } catch { toast.error('Failed') }
  }

  const upgradePlan = async () => {
    if (!planId) return
    try {
      await api.patch(`/superadmin/tenants/${id}/plan`, { plan_id: parseInt(planId) })
      toast.success('Plan updated')
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!detail) return <p className="text-sm text-muted py-8 text-center">Tenant not found.</p>

  const { tenant, usage, monthly_orders } = detail
  const maxOrd = Math.max(...(monthly_orders?.map((m) => m.cnt) ?? [1]), 1)

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      <m.div variants={staggerItem} className="flex items-center gap-4">
        <button onClick={() => navigate('/superadmin/tenants')} className="p-1 hover:opacity-70 transition-opacity">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider">{tenant.name}</h1>
          <p className="text-xs text-muted">{tenant.slug} · {tenant.sector}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm ${STATUS_COLORS[tenant.status] ?? ''}`}>
            {tenant.status}
          </span>
        </div>
      </m.div>

      {/* Usage Cards */}
      <m.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Products', value: usage.products,  icon: Package,     limit: tenant.limits?.products_max },
          { label: 'Users',    value: usage.users,     icon: Users,       limit: tenant.limits?.users_max },
          { label: 'Orders',   value: usage.orders,    icon: ShoppingCart,limit: null },
          { label: 'Revenue',  value: `$${usage.revenue?.toFixed(0)}`, icon: TrendingUp, limit: null },
        ].map(({ label, value, icon: Icon, limit }) => (
          <div key={label} className="bg-white border border-accent p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
              <Icon size={12} className="text-muted" />
            </div>
            <p className="text-xl font-black">{value}</p>
            {limit !== null && limit !== undefined && (
              <p className="text-[10px] text-muted mt-1">
                {limit === -1 ? 'Unlimited' : `/ ${limit} max`}
              </p>
            )}
          </div>
        ))}
      </m.div>

      {/* Tabs */}
      <m.div variants={staggerItem}>
        <div className="flex gap-0 border-b border-accent mb-6">
          {(['overview', 'invoices', 'features'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-black text-black' : 'border-transparent text-muted hover:text-black'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info */}
            <div className="bg-white border border-accent p-5 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted mb-3">Shop Info</h3>
              {[
                ['Owner', `${tenant.owner_name} (${tenant.owner_email})`],
                ['Plan', `${tenant.plan_name} · ${tenant.sub_status}`],
                ['Period End', tenant.current_period_end ? new Date(tenant.current_period_end).toLocaleDateString() : '—'],
                ['Domain', tenant.domain ?? '—'],
                ['Created', new Date(tenant.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted font-bold uppercase tracking-wider">{k}</span>
                  <span className="font-bold text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="bg-white border border-accent p-5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['active','trial','suspended','cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      disabled={tenant.status === s}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-colors disabled:opacity-40 ${
                        tenant.status === s ? 'bg-black text-white border-black' : 'border-accent hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-accent p-5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted mb-3">Force Plan Change</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    placeholder="Plan ID"
                    className="flex-1 border border-accent px-3 py-2 text-xs font-bold focus:outline-none focus:border-black"
                  />
                  <Button size="sm" onClick={upgradePlan}>Update</Button>
                </div>
              </div>
            </div>

            {/* Monthly Orders Chart */}
            {monthly_orders && monthly_orders.length > 0 && (
              <div className="bg-white border border-accent p-5 lg:col-span-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted mb-4">Orders (6 months)</h3>
                <div className="flex items-end gap-2 h-24">
                  {monthly_orders.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative flex-1 w-full flex items-end">
                        <m.div
                          className="w-full bg-black opacity-80 group-hover:opacity-100"
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.cnt / maxOrd) * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] as const }}
                        />
                      </div>
                      <span className="text-[9px] text-muted">{d.m.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'invoices' && (
          <div className="bg-white border border-accent overflow-hidden">
            <table className="w-full text-xs">
              <thead className="border-b border-accent bg-[#FAFAFA]">
                <tr>
                  {['Invoice #', 'Period', 'Amount', 'Status', 'Paid At'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-black uppercase tracking-wider text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No invoices.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-accent last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-mono font-bold">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-muted">{inv.period_start?.slice(0, 10)} → {inv.period_end?.slice(0, 10)}</td>
                    <td className="px-4 py-3 font-bold">{parseFloat(inv.amount).toFixed(2)} {inv.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm ${STATUS_COLORS[inv.status] ?? ''}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'features' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(tenant.features ?? {}).map(([key, val]) => (
              <div key={key} className={`border p-3 text-xs ${val ? 'border-green-200 bg-green-50' : 'border-accent bg-[#FAFAFA]'}`}>
                <div className={`w-2 h-2 rounded-full mb-2 ${val ? 'bg-green-500' : 'bg-gray-300'}`} />
                <p className={`font-bold uppercase tracking-wider ${val ? 'text-green-800' : 'text-muted'}`}>{key.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        )}
      </m.div>
    </m.div>
  )
}
