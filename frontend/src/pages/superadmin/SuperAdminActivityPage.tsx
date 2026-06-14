import { useEffect, useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import Input from '../../components/ui/Input'
import { Search } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

interface LogEntry {
  id: number
  tenant_id: number | null
  user_id: number | null
  user_email: string | null
  action: string
  entity_type: string | null
  entity_id: number | null
  meta: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

function actionColor(action: string): string {
  if (action.includes('delete')) return 'text-red-700 bg-red-50'
  if (action.includes('suspend') || action.includes('cancelled')) return 'text-orange-700 bg-orange-50'
  if (action.includes('paid') || action.includes('active')) return 'text-green-700 bg-green-50'
  if (action.includes('create') || action.includes('invite')) return 'text-blue-700 bg-blue-50'
  return 'text-gray-600 bg-gray-100'
}

export default function SuperAdminActivityPage() {
  const [logs, setLogs]             = useState<LogEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [action, setAction]         = useState('')
  const [tenantId, setTenantId]     = useState('')
  const debouncedAction             = useDebounce(action, 400)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/superadmin/activity', {
        params: {
          page,
          limit: 50,
          action: debouncedAction || undefined,
          tenant_id: tenantId || undefined,
        },
      })
      setLogs(r.data.logs ?? [])
      setTotalPages(r.data.pagination?.total_pages ?? 1)
    } catch { setLogs([]) }
    finally { setLoading(false) }
  }, [page, debouncedAction, tenantId])

  useEffect(() => { load() }, [load])

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible" className="space-y-6">
      <m.div variants={staggerItem} className="flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-wider">Activity Logs</h1>
      </m.div>

      <m.div variants={staggerItem} className="flex gap-3 flex-wrap">
        <div className="w-64">
          <Input
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1) }}
            placeholder="Filter by action..."
            icon={<Search size={14} />}
          />
        </div>
        <input
          type="number"
          value={tenantId}
          onChange={(e) => { setTenantId(e.target.value); setPage(1) }}
          placeholder="Tenant ID"
          className="border border-accent px-3 py-2 text-xs font-bold w-32 focus:outline-none focus:border-black"
        />
      </m.div>

      <m.div variants={staggerItem} className="bg-white border border-accent overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-accent bg-[#FAFAFA]">
            <tr>
              {['Time', 'User', 'Action', 'Entity', 'Tenant', 'IP'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-black uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No activity found.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-b border-accent last:border-0 hover:bg-[#FAFAFA]">
                <td className="px-4 py-2 text-muted whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-muted truncate max-w-[120px]">
                  {log.user_email ?? (log.user_id != null ? `#${log.user_id}` : '—')}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm ${actionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted">
                  {log.entity_type ? `${log.entity_type} #${log.entity_id}` : '—'}
                </td>
                <td className="px-4 py-2 text-muted">{log.tenant_id ?? '—'}</td>
                <td className="px-4 py-2 text-muted font-mono">{log.ip_address ?? '—'}</td>
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
