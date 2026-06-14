import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'

interface Invoice {
  id: number
  invoice_number: string
  tenant_name: string
  status: 'open' | 'paid' | 'void'
  amount: string
  currency: string
  period_start: string
  period_end: string
  due_date: string | null
  paid_at: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-green-700 bg-green-50',
  open: 'text-yellow-700 bg-yellow-50',
  void: 'text-gray-500 bg-gray-100',
}

export default function SuperAdminInvoicesPage() {
  const [invoices, setInvoices]     = useState<Invoice[]>([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatus]   = useState('')
  const [paying, setPaying]         = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/superadmin/invoices', {
        params: { page, limit: 20, status: statusFilter || undefined },
      })
      setInvoices(r.data.invoices ?? [])
      setTotalPages(r.data.pagination?.total_pages ?? 1)
    } catch { setInvoices([]) }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  const markPaid = async (id: number) => {
    setPaying(id)
    try {
      await api.patch(`/superadmin/invoices/${id}/pay`)
      toast.success('Invoice marked as paid')
      load()
    } catch { toast.error('Failed') }
    finally { setPaying(null) }
  }

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible" className="space-y-6">
      <m.div variants={staggerItem} className="flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-wider">Invoices</h1>
        <div className="flex gap-2">
          {['', 'open', 'paid', 'void'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-colors ${
                statusFilter === s ? 'bg-black text-white border-black' : 'border-accent hover:border-black'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </m.div>

      <m.div variants={staggerItem} className="bg-white border border-accent overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-accent bg-[#FAFAFA]">
            <tr>
              {['Invoice #', 'Shop', 'Period', 'Amount', 'Status', 'Due', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-black uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No invoices found.</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-accent last:border-0 hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-mono font-bold text-indigo-700">{inv.invoice_number}</td>
                <td className="px-4 py-3 font-bold">{inv.tenant_name}</td>
                <td className="px-4 py-3 text-muted">
                  {inv.period_start?.slice(0, 7)} → {inv.period_end?.slice(0, 7)}
                </td>
                <td className="px-4 py-3 font-bold">{parseFloat(inv.amount).toFixed(2)} {inv.currency}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm ${STATUS_COLORS[inv.status] ?? ''}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{inv.due_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3">
                  {inv.status === 'open' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={paying === inv.id}
                      onClick={() => markPaid(inv.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </m.div>

      <div className="flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </m.div>
  )
}
