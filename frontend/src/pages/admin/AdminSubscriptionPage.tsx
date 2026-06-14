import { useEffect, useState } from 'react'
import { Check, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'

interface Subscription {
  plan_name: string
  plan_slug: string
  status: string
  price_monthly: string
  price_yearly: string
  current_period_end: string | null
  limits: Record<string, number>
  features: Record<string, boolean>
}

interface Usage {
  products: number
  products_max: number
  products_pct: number
  users: number
  users_max: number
  users_pct: number
  orders_month: number
  orders_max: number
  orders_pct: number
}

interface Plan {
  id: number
  name: string
  slug: string
  price_monthly: string
  price_yearly: string
  limits: Record<string, number>
  features: Record<string, boolean>
  is_popular: boolean
}

interface Invoice {
  id: number
  invoice_number: string
  status: string
  amount: string
  currency: string
  period_start: string
  period_end: string
  paid_at: string | null
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-green-700 bg-green-50',
  trialing:  'text-blue-700 bg-blue-50',
  suspended: 'text-red-700 bg-red-50',
  cancelled: 'text-gray-500 bg-gray-100',
  paid:      'text-green-700 bg-green-50',
  open:      'text-yellow-700 bg-yellow-50',
}

function UsageBar({ label, current, max, pct }: { label: string; current: number; max: number; pct: number }) {
  const isUnlimited = max === -1
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-black'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold uppercase tracking-wider text-muted">{label}</span>
        <span className="font-black">
          {current} {isUnlimited ? '/ ∞' : `/ ${max}`}
        </span>
      </div>
      <div className="h-2 bg-accent overflow-hidden rounded-full">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${isUnlimited ? 'bg-green-400' : color}`}
          style={{ width: `${isUnlimited ? 30 : Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}

export default function AdminSubscriptionPage() {
  const [sub, setSub]           = useState<Subscription | null>(null)
  const [usage, setUsage]       = useState<Usage | null>(null)
  const [plans, setPlans]       = useState<Plan[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [upgrading, setUpgrading] = useState<number | null>(null)
  const [tab, setTab]           = useState<'overview' | 'plans' | 'invoices'>('overview')

  useEffect(() => {
    Promise.all([
      api.get('/admin/subscription'),
      api.get('/admin/subscription/usage'),
      api.get('/admin/subscription/plans'),
      api.get('/admin/subscription/invoices'),
    ]).then(([s, u, p, i]) => {
      setSub(s.data.subscription)
      setUsage(u.data.usage)
      setPlans(p.data.plans ?? [])
      setInvoices(i.data.invoices ?? [])
    }).catch(() => toast.error('Failed to load subscription'))
      .finally(() => setLoading(false))
  }, [])

  const requestUpgrade = async (planId: number) => {
    setUpgrading(planId)
    try {
      await api.post('/admin/subscription/upgrade', { plan_id: planId })
      toast.success('Upgrade request sent! Our team will contact you.')
    } catch { toast.error('Failed to send upgrade request') }
    finally { setUpgrading(null) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      <m.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider">Subscription</h1>
          {sub && (
            <p className="text-xs text-muted mt-1">
              Plan: <strong>{sub.plan_name}</strong> ·{' '}
              <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm ${STATUS_COLORS[sub.status] ?? ''}`}>
                {sub.status}
              </span>
              {sub.current_period_end && (
                <> · Renews {new Date(sub.current_period_end).toLocaleDateString()}</>
              )}
            </p>
          )}
        </div>
      </m.div>

      {/* Tabs */}
      <m.div variants={staggerItem}>
        <div className="flex gap-0 border-b border-accent mb-6">
          {(['overview', 'plans', 'invoices'] as const).map((t) => (
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
          <div className="space-y-6">
            {/* Usage */}
            {usage && (
              <div className="bg-white border border-accent p-5 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted">Resource Usage</h3>
                <UsageBar label="Products"       current={usage.products}     max={usage.products_max}    pct={usage.products_pct} />
                <UsageBar label="Team Members"   current={usage.users}        max={usage.users_max}       pct={usage.users_pct} />
                <UsageBar label="Orders (Month)" current={usage.orders_month} max={usage.orders_max}      pct={usage.orders_pct} />
              </div>
            )}

            {/* Current plan features */}
            {sub && (
              <div className="bg-white border border-accent p-5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted mb-4">Included Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(sub.features ?? {}).map(([key, val]) => (
                    <div key={key} className={`flex items-center gap-2 py-1.5 px-2 text-xs ${val ? '' : 'opacity-40'}`}>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center ${val ? 'bg-black' : 'bg-gray-200'}`}>
                        {val && <Check size={8} className="text-white" />}
                      </div>
                      <span className={`capitalize ${val ? 'font-bold' : 'text-muted'}`}>
                        {key.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'plans' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.slug === sub?.plan_slug
              return (
                <div
                  key={plan.id}
                  className={`border p-5 relative ${isCurrent ? 'border-black ring-1 ring-black' : 'border-accent'}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-black text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                        Popular
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                        Current
                      </span>
                    </div>
                  )}

                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">{plan.name}</h3>
                  <p className="text-2xl font-black mb-1">
                    ${parseFloat(plan.price_monthly).toFixed(0)}
                    <span className="text-xs font-normal text-muted">/mo</span>
                  </p>
                  <p className="text-[10px] text-muted mb-4">${parseFloat(plan.price_yearly).toFixed(0)}/yr</p>

                  <div className="space-y-1.5 mb-5">
                    {[
                      `${plan.limits?.products_max === -1 ? '∞' : plan.limits?.products_max} products`,
                      `${plan.limits?.users_max === -1 ? '∞' : plan.limits?.users_max} users`,
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs">
                        <Check size={10} className="text-green-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {Object.entries(plan.features ?? {})
                      .filter(([, v]) => v)
                      .slice(0, 4)
                      .map(([key]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <Check size={10} className="text-green-600 flex-shrink-0" />
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        </div>
                      ))
                    }
                  </div>

                  {isCurrent ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-muted">
                      <Check size={12} />
                      Current Plan
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="sm"
                      loading={upgrading === plan.id}
                      onClick={() => requestUpgrade(plan.id)}
                    >
                      <Zap size={12} className="mr-1" />
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </div>
              )
            })}
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
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No invoices yet.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-accent last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-muted">{inv.period_start?.slice(0, 7)} → {inv.period_end?.slice(0, 7)}</td>
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
      </m.div>
    </m.div>
  )
}
