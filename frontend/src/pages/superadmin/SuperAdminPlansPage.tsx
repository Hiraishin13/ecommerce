import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

interface Plan {
  id: number
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  is_public: number
  sort_order: number
}

const emptyForm = { name: '', slug: '', price_monthly: 0, price_yearly: 0, is_public: 1, sort_order: 0 }

export default function SuperAdminPlansPage() {
  const [plans, setPlans]       = useState<Plan[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState<Plan | null>(null)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/superadmin/plans')
      setPlans(r.data.plans ?? [])
    } catch { setPlans([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p: Plan) => {
    setEditing(p)
    setForm({ name: p.name, slug: p.slug, price_monthly: p.price_monthly, price_yearly: p.price_yearly, is_public: p.is_public, sort_order: p.sort_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/superadmin/plans/${editing.id}`, form)
        toast.success('Plan updated')
      } else {
        await api.post('/superadmin/plans', form)
        toast.success('Plan created')
      }
      setModalOpen(false)
      load()
    } catch { toast.error('Failed to save plan') }
    finally { setSaving(false) }
  }

  const handleDelete = async (p: Plan) => {
    if (!confirm(`Delete plan "${p.name}"?`)) return
    try {
      await api.delete(`/superadmin/plans/${p.id}`)
      toast.success('Plan deleted')
      load()
    } catch { toast.error('Failed to delete plan') }
  }

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible">
      <m.div variants={staggerItem} className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Plans</h1>
        <Button onClick={openCreate} size="sm"><Plus size={14} /> New Plan</Button>
      </m.div>

      <m.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted text-xs col-span-3">Loading...</p>
        ) : plans.map((p) => (
          <div key={p.id} className="bg-white border border-accent p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-black text-sm uppercase tracking-wider">{p.name}</p>
                <p className="text-xs text-muted">{p.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-accent transition-colors"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(p)} className="p-1.5 hover:bg-accent transition-colors text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-xl font-black">${p.price_monthly}<span className="text-xs font-normal text-muted">/mo</span></p>
            <p className="text-xs text-muted mt-1">${p.price_yearly}/yr · {p.is_public ? 'Public' : 'Hidden'}</p>
          </div>
        ))}
      </m.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Plan' : 'New Plan'}>
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monthly price ($)" type="number" value={form.price_monthly} onChange={(e) => setForm((f) => ({ ...f, price_monthly: +e.target.value }))} />
            <Input label="Yearly price ($)" type="number" value={form.price_yearly} onChange={(e) => setForm((f) => ({ ...f, price_yearly: +e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-black" checked={!!form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked ? 1 : 0 }))} />
            <span className="text-xs font-bold uppercase tracking-wider">Public (visible on signup page)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'} Plan</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </m.div>
  )
}
