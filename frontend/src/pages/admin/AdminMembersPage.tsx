import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

interface Member {
  user_id: number
  name: string
  email: string
  role: string
  is_active: number
  created_at: string
}

const ROLES = ['admin', 'manager', 'cashier', 'staff']

const ROLE_COLORS: Record<string, string> = {
  owner:   'text-purple-700',
  admin:   'text-blue-700',
  manager: 'text-green-700',
  cashier: 'text-orange-600',
  staff:   'text-muted',
}

export default function AdminMembersPage() {
  const [members, setMembers]   = useState<Member[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [inviteName, setInviteName]   = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState('staff')
  const [inviting, setInviting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/admin/members')
      setMembers(r.data.members ?? [])
    } catch { setMembers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleInvite = async () => {
    if (!inviteName || !inviteEmail) { toast.error('Remplissez tous les champs.'); return }
    setInviting(true)
    try {
      await api.post('/admin/members', { name: inviteName, email: inviteEmail, role: inviteRole })
      toast.success('Membre ajouté')
      setModalOpen(false)
      setInviteName('')
      setInviteEmail('')
      setInviteRole('staff')
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur'
      toast.error(msg)
    } finally { setInviting(false) }
  }

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await api.patch(`/admin/members/${userId}/role`, { role })
      toast.success('Rôle mis à jour')
      load()
    } catch { toast.error('Erreur') }
  }

  const handleRemove = async (userId: number, name: string) => {
    if (!confirm(`Supprimer ${name} de l'équipe ?`)) return
    try {
      await api.delete(`/admin/members/${userId}`)
      toast.success('Membre retiré')
      load()
    } catch { toast.error('Erreur') }
  }

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible">
      <m.div variants={staggerItem} className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Équipe</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}><Plus size={14} /> Ajouter</Button>
      </m.div>

      <m.div variants={staggerItem} className="bg-white border border-accent overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-accent bg-[#FAFAFA]">
            <tr>
              {['Nom', 'Email', 'Rôle', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-black uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">Chargement...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">Aucun membre.</td></tr>
            ) : members.map((m) => (
              <tr key={m.user_id} className="border-b border-accent last:border-b-0 hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-bold">{m.name}</td>
                <td className="px-4 py-3 text-muted">{m.email}</td>
                <td className="px-4 py-3">
                  {m.role === 'owner' ? (
                    <span className={`font-black uppercase tracking-wider ${ROLE_COLORS['owner']}`}>Owner</span>
                  ) : (
                    <select
                      className="border border-accent px-2 py-1 text-xs focus:outline-none bg-white"
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  {m.role !== 'owner' && (
                    <button onClick={() => handleRemove(m.user_id, m.name)} className="p-1.5 hover:bg-accent transition-colors text-red-600">
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </m.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un membre">
        <div className="space-y-3">
          <Input label="Nom" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jean Dupont" />
          <Input label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jean@exemple.com" />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Rôle</label>
            <select className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleInvite} loading={inviting}>Ajouter</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>
    </m.div>
  )
}
