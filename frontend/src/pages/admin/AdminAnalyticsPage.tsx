import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react'
import api from '../../services/api'
import { formatPrice } from '../../utils/formatPrice'
import { stagger, staggerItem } from '../../utils/motion'
import Spinner from '../../components/ui/Spinner'

interface MonthStat {
  month:   string
  orders:  number
  revenue: string
}

interface TopProduct {
  product_name: string
  qty_sold:     number
  revenue:      string
}

interface Stats {
  monthly:       MonthStat[]
  top_products:  TopProduct[]
  total_orders:  number
  total_revenue: number
}

function BarChart({ data, valueKey, labelKey, color = 'bg-black' }: {
  data: Record<string, unknown>[]
  valueKey: string
  labelKey: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => parseFloat(String(d[valueKey])) || 0), 1)
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((d, i) => {
        const val  = parseFloat(String(d[valueKey])) || 0
        const pct  = (val / max) * 100
        const lbl  = String(d[labelKey])
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <m.div
                className={`w-full ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <span className="text-[10px] text-muted truncate w-full text-center">{lbl.slice(5)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/admin/orders/stats?months=6')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  }

  if (!stats) {
    return <p className="text-sm text-muted py-8 text-center">Impossible de charger les statistiques.</p>
  }

  const totalRevFromMonthly = stats.monthly.reduce((s, m) => s + parseFloat(m.revenue || '0'), 0)

  return (
    <div>
      <m.h1
        className="text-xl font-black uppercase tracking-wider mb-6"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Analytics
      </m.h1>

      {/* KPIs */}
      <m.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={stagger(0.07)}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Total Orders',   value: stats.total_orders,             icon: ShoppingCart, color: 'bg-black text-white'         },
          { label: 'Revenue (6 mo)', value: formatPrice(totalRevFromMonthly), icon: DollarSign,  color: 'bg-[#388E3C] text-white'     },
          { label: 'Avg per Order',  value: stats.total_orders > 0 ? formatPrice(totalRevFromMonthly / stats.monthly.reduce((s,m)=>s+Number(m.orders),0)||0) : '—', icon: TrendingUp, color: 'bg-[#1565C0] text-white' },
          { label: 'Top Products',   value: stats.top_products.length,      icon: Package,      color: 'bg-[#F57C00] text-white'     },
        ].map((kpi) => (
          <m.div
            key={kpi.label}
            variants={staggerItem}
            className="border border-accent p-5"
            whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.18 }}
          >
            <div className={`w-10 h-10 flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-2xl font-black mb-1">{kpi.value}</p>
            <p className="text-xs text-muted uppercase tracking-wider">{kpi.label}</p>
          </m.div>
        ))}
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <m.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="border border-accent p-5"
        >
          <h2 className="text-xs font-black uppercase tracking-wider mb-4">Revenue (6 derniers mois)</h2>
          {stats.monthly.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Pas encore de données</p>
          ) : (
            <BarChart data={stats.monthly as unknown as Record<string,unknown>[]} valueKey="revenue" labelKey="month" color="bg-black" />
          )}
        </m.div>

        {/* Orders chart */}
        <m.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="border border-accent p-5"
        >
          <h2 className="text-xs font-black uppercase tracking-wider mb-4">Commandes (6 derniers mois)</h2>
          {stats.monthly.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Pas encore de données</p>
          ) : (
            <BarChart data={stats.monthly as unknown as Record<string,unknown>[]} valueKey="orders" labelKey="month" color="bg-[#388E3C]" />
          )}
        </m.div>

        {/* Top products */}
        <m.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="border border-accent p-5 lg:col-span-2"
        >
          <h2 className="text-xs font-black uppercase tracking-wider mb-4">Top Produits</h2>
          {stats.top_products.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Pas encore de ventes</p>
          ) : (
            <div className="space-y-3">
              {stats.top_products.map((p, i) => {
                const maxQty = Math.max(...stats.top_products.map((x) => Number(x.qty_sold)), 1)
                const pct    = (Number(p.qty_sold) / maxQty) * 100
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs font-black text-muted w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold truncate">{p.product_name}</p>
                        <p className="text-xs text-muted ml-2 flex-shrink-0">{p.qty_sold} vendus · {formatPrice(parseFloat(p.revenue))}</p>
                      </div>
                      <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                        <m.div
                          className="h-full bg-black"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.08 }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </m.div>
      </div>
    </div>
  )
}
