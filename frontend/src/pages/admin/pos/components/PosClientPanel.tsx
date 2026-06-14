import { useState } from 'react'
import { User, Phone, UserX } from 'lucide-react'
import type { PosClient } from '../../../../store/posStore'

interface Props {
  client:    PosClient | null
  onChange:  (client: PosClient | null) => void
}

export default function PosClientPanel({ client, onChange }: Props) {
  const [mode, setMode] = useState<'invite' | 'compte'>('invite')
  const [nom, setNom]   = useState(client?.client_nom       ?? '')
  const [tel, setTel]   = useState(client?.client_telephone ?? '')

  const appliquer = () => {
    if (!nom.trim() && !tel.trim()) {
      onChange(null)
      return
    }
    onChange({
      client_id:        null,
      client_nom:       nom.trim()  || null,
      client_telephone: tel.trim()  || null,
    } as PosClient)
  }

  const effacer = () => {
    setNom('')
    setTel('')
    onChange(null)
  }

  return (
    <div className="border border-accent p-3">
      {/* Onglets mode */}
      <div className="flex gap-1 mb-3">
        {(['invite', 'compte'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
              mode === m
                ? 'bg-black text-white border-black'
                : 'border-accent hover:border-black'
            }`}
          >
            {m === 'invite' ? 'Invité' : 'Compte client'}
          </button>
        ))}
      </div>

      {mode === 'invite' && (
        <div className="space-y-2">
          {/* Nom */}
          <div className="relative">
            <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onBlur={appliquer}
              placeholder="Nom client (optionnel)"
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
            />
          </div>

          {/* Téléphone */}
          <div className="relative">
            <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              onBlur={appliquer}
              placeholder="+243 8XX XXX XXX"
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
            />
          </div>
        </div>
      )}

      {mode === 'compte' && (
        <p className="text-[10px] text-muted italic text-center py-2">
          Recherche client disponible en Phase 5 (CRM)
        </p>
      )}

      {/* Résumé client sélectionné */}
      {client && (
        <div className="mt-2 flex items-center justify-between bg-[#FAFAFA] px-2 py-1.5 border border-accent">
          <div>
            {client.client_nom && (
              <p className="text-[10px] font-bold">{client.client_nom}</p>
            )}
            {client.client_telephone && (
              <p className="text-[10px] text-muted">{client.client_telephone}</p>
            )}
          </div>
          <button onClick={effacer} className="p-0.5 hover:bg-accent transition-colors">
            <UserX size={12} className="text-muted" />
          </button>
        </div>
      )}
    </div>
  )
}
