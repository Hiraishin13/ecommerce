import { useEffect, useState } from 'react'
import { Building2, CreditCard, TrendingUp, Zap, DollarSign, AlertCircle } from 'lucide-react'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'

interface RevenueMonth { month: string; revenue: string; invoice_count: number }
interface TopPlan      { name: string; slug: string; tenant_count: number; price_monthly: string }
interface RecentTenant { id: number; name: string; slug: string; status: string; plan_name: string; owner_email: string; created_at: string }
interface StatusItem   { status: string; cnt: number }

interface Stats {
  kpis: {
    tenant_count: number
    active_subscriptions: number
    mrr: number
    arr: number
    total_revenue: number
    new_trials_7d: number
    expiring_soon: number
  }
  top_plans:        TopPlan[]
  revenue_chart:    RevenueMonth[]
  recent_tenants:   RecentTenant[]
  status_breakdown: StatusItem[]
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-green-700 bg-green-50',
  trial:     'text-blue-700 bg-blue-50',
  suspended: 'text-red-700 bg-red-50',
  cancelled: 'text-gray-500 bg-gray-100',
}

function MiniBarChart({ data }: { data: RevenueMonth[] }) {
  const max = Math.max(...data.map((d) => parseFloat(d.revenue || '0')), 1)
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const val = parseFloat(d.revenue || '0')
        const pct = (val / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              ${parseFloat(d.revenue || '0').toFixed(0)}
            </div>
            <div className="relative flex-1 w-full flex items-end">
              <m.div
                className="w-full bg-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity"
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] as const }}
              />
            </div>
            <span className="text-[9px] text-white/50 truncate w-full text-center">{d.month.slice(5)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function SuperAdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/superadmin/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`

  const kpis = [
    { label: 'Total Shops',          value: stats?.kpis.tenant_count,            icon: Building2,   suffix: '' },
    { label: 'Active Subscriptions', value: stats?.kpis.active_subscriptions,    icon: CreditCard,  suffix: '' },
    { label: 'MRR',                  value: stats ? fmt(stats.kpis.mrr) : null,  icon: TrendingUp,  suffix: '' },
    { label: 'ARR',                  value: stats ? fmt(stats.kpis.arr) : null,  icon: DollarSign,  suffix: '' },
    { label: 'Total Revenue',        value: stats ? fmt(stats.kpis.total_revenue) : null, icon: DollarSign, suffix: '' },
    { label: 'New Trials (7d)',      value: stats?.kpis.new_trials_7d,            icon: Zap,         suffix: '' },
    { label: 'Expiring Soon',        value: stats?.kpis.expiring_soon,            icon: AlertCircle, suffix: '' },
  ]

  const totalTenants = stats?.kpis.tenant_count || 1

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible" className="space-y-6">
      <m.h1 variants={staggerItem} className="text-xl font-black uppercase tracking-wider">
        Platform Overview
      </m.h1>

      {/* KPI Grid */}
      <m.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-white/10 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</span>
              <Icon size={12} className="text-white/30" />
            </div>
            <p className="text-xl font-black text-white">{loading ? '—' : (value ?? '—')}</p>
          </div>
        ))}
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {stats?.revenue_chart && stats.revenue_chart.length > 0 && (
          <m.div variants={staggerItem} className="bg-white/5 border border-white/10 p-5 rounded">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-4">
              Revenue – Last 12 Months
            </h2>
            <MiniBarChart data={stats.revenue_chart} />
          </m.div>
        )}

        {/* Plans Distribution */}
        {stats?.top_plans && stats.top_plans.length > 0 && (
          <m.div variants={staggerItem} className="bg-white/5 border border-white/10 p-5 rounded">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-4">
              Plans Distribution
            </h2>
            <div className="space-y-3">
              {stats.top_plans.map((p) => (
                <div key={p.slug} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold w-20 truncate uppercase tracking-wider text-white/80">{p.name}</span>
                  <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (p.tenant_count / totalTenants) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-6 text-right text-white/60">{p.tenant_count}</span>
                  <span className="text-[10px] text-white/30 w-14 text-right">${p.price_monthly}/mo</span>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        {stats?.recent_tenants && stats.recent_tenants.length > 0 && (
          <m.div variants={staggerItem} className="bg-white/5 border border-white/10 p-5 rounded">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-4">Recent Shops</h2>
            <div className="space-y-2">
              {stats.recent_tenants.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{t.owner_email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm ${STATUS_COLORS[t.status] ?? ''}`}>
                      {t.status}
                    </span>
                    <p className="text-[9px] text-white/30 mt-0.5">{t.plan_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </m.div>
        )}

        {/* Status Breakdown */}
        {stats?.status_breakdown && stats.status_breakdown.length > 0 && (
          <m.div variants={staggerItem} className="bg-white/5 border border-white/10 p-5 rounded">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-4">Shop Status</h2>
            <div className="space-y-3">
              {stats.status_breakdown.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm w-20 text-center ${STATUS_COLORS[s.status] ?? 'text-white bg-white/10'}`}>
                    {s.status}
                  </span>
                  <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white/40 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (s.cnt / totalTenants) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/60 w-6 text-right">{s.cnt}</span>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </div>
    </m.div>
  )
}
