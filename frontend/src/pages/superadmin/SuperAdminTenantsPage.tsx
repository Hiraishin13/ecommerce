import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { useDebounce } from '../../hooks/useDebounce'

interface Tenant {
  id: number
  name: string
  slug: string
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  plan_name: string
  owner_name: string
  owner_email: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-green-700 bg-green-50',
  trial:     'text-blue-700 bg-blue-50',
  suspended: 'text-red-700 bg-red-50',
  cancelled: 'text-gray-500 bg-gray-100',
}

export default function SuperAdminTenantsPage() {
  const navigate                = useNavigate()
  const [tenants, setTenants]   = useState<Tenant[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch]     = useState('')
  const debouncedSearch         = useDebounce(search, 400)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/superadmin/tenants', { params: { page, limit: 20, search: debouncedSearch } })
      setTenants(r.data.tenants ?? [])
      setTotalPages(r.data.pagination?.total_pages ?? 1)
    } catch { setTenants([]) }
    finally { setLoading(false) }
  }, [page, debouncedSearch])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/superadmin/tenants/${id}/status`, { status })
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible">
      <m.div variants={staggerItem} className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Shops</h1>
      </m.div>

      <m.div variants={staggerItem} className="mb-4 max-w-xs">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops..." icon={<Search size={14} />} />
      </m.div>

      <m.div variants={staggerItem} className="bg-white border border-accent overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-accent bg-[#FAFAFA]">
            <tr>
              {['Shop', 'Slug', 'Plan', 'Status', 'Owner', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-black uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No shops found.</td></tr>
            ) : tenants.map((t) => (
              <tr key={t.id} className="border-b border-accent last:border-b-0 hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-bold">{t.name}</td>
                <td className="px-4 py-3 text-muted">{t.slug}</td>
                <td className="px-4 py-3">{t.plan_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm ${STATUS_COLORS[t.status] ?? ''}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{t.owner_name ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap items-center">
                    <button onClick={() => navigate(`/superadmin/tenants/${t.id}`)} className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:underline">View</button>
                    {t.status !== 'active' && (
                      <button onClick={() => updateStatus(t.id, 'active')} className="text-[10px] font-bold uppercase tracking-wider text-green-700 hover:underline">Activate</button>
                    )}
                    {t.status !== 'suspended' && (
                      <button onClick={() => updateStatus(t.id, 'suspended')} className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:underline">Suspend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </m.div>

      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </m.div>
  )
}
