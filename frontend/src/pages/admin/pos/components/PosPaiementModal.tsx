import React, { useState } from 'react'
import { X, Plus, Trash2, AlertCircle, Banknote, Smartphone, CreditCard, BookOpen } from 'lucide-react'
import { formatCDF } from '../../../../utils/formatCDF'
import type { PosPaiementLigne } from '../../../../store/posStore'

// ── Types ──────────────────────────────────────────────────────────────────

type ModePaiement = PosPaiementLigne['mode']

const MODES: { value: ModePaiement; label: string; icon: React.ElementType }[] = [
  { value: 'cash',         label: 'Cash',          icon: Banknote    },
  { value: 'mobile_money', label: 'Mobile Money',  icon: Smartphone  },
  { value: 'carte',        label: 'Carte',          icon: CreditCard  },
  { value: 'credit',       label: 'Crédit client',  icon: BookOpen    },
]

const OPERATEURS = [
  { value: 'mpesa',        label: 'M-Pesa' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'africell',     label: 'Africell' },
]

interface Props {
  total:        number
  onConfirmer:  (paiements: PosPaiementLigne[], estAcompte: boolean) => void
  onFermer:     () => void
}

// ── Composant ──────────────────────────────────────────────────────────────

export default function PosPaiementModal({ total, onConfirmer, onFermer }: Props) {
  const [lignes, setLignes] = useState<PosPaiementLigne[]>([
    { mode: 'cash', montant: total, est_acompte: false },
  ])
  const [estAcompte, setEstAcompte] = useState(false)

  const totalPaye   = lignes.reduce((acc, l) => acc + (l.montant || 0), 0)
  const rendu       = Math.max(0, totalPaye - total)
  const solde       = Math.max(0, total - totalPaye)
  const peutValider = estAcompte ? totalPaye > 0 : totalPaye >= total

  // ── Gestion des lignes ──────────────────────────────────────────────────

  const ajouterLigne = () => {
    const resteAPayer = Math.max(0, total - totalPaye)
    setLignes((prev) => [
      ...prev,
      { mode: 'mobile_money', montant: resteAPayer, est_acompte: false },
    ])
  }

  const supprimerLigne = (i: number) =>
    setLignes((prev) => prev.filter((_, idx) => idx !== i))

  const mettreAJour = <K extends keyof PosPaiementLigne>(
    i: number,
    champ: K,
    valeur: PosPaiementLigne[K]
  ) =>
    setLignes((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [champ]: valeur } : l))
    )

  // Remplir automatiquement le montant du solde restant
  const remplirSolde = (i: number) =>
    mettreAJour(i, 'montant', Math.max(0, total - totalPaye + (lignes[i]?.montant || 0)))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-accent flex-shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-wider">Encaissement</p>
            <p className="text-sm font-black mt-0.5">{formatCDF(total)}</p>
          </div>
          <button onClick={onFermer} className="p-1 hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {/* Lignes de paiement */}
          {lignes.map((ligne, i) => (
            <div key={i} className="border border-accent p-3 space-y-2">
              {/* Mode */}
              <div className="flex gap-1 flex-wrap">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => mettreAJour(i, 'mode', m.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold border transition-colors ${
                      ligne.mode === m.value
                        ? 'bg-black text-white border-black'
                        : 'border-accent hover:border-black'
                    }`}
                  >
                    <m.icon size={11} /> {m.label}
                  </button>
                ))}
              </div>

              {/* Montant */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min={0}
                    value={ligne.montant || ''}
                    onChange={(e) => mettreAJour(i, 'montant', Math.max(0, Number(e.target.value)))}
                    placeholder="Montant"
                    className="w-full pr-8 pl-3 py-2 text-sm font-bold border border-accent focus:outline-none focus:border-black bg-white"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted font-bold">
                    FC
                  </span>
                </div>
                <button
                  onClick={() => remplirSolde(i)}
                  className="text-[10px] text-muted hover:text-black uppercase tracking-wider border border-accent px-2 py-2 hover:border-black transition-colors"
                  title="Remplir avec le solde"
                >
                  Solde
                </button>
                {lignes.length > 1 && (
                  <button
                    onClick={() => supprimerLigne(i)}
                    className="p-2 hover:bg-accent transition-colors text-muted"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Détails Mobile Money */}
              {ligne.mode === 'mobile_money' && (
                <div className="space-y-1.5">
                  <select
                    value={ligne.operateur ?? ''}
                    onChange={(e) => mettreAJour(i, 'operateur', e.target.value || null)}
                    className="w-full px-3 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
                  >
                    <option value="">Opérateur…</option>
                    {OPERATEURS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={ligne.telephone_payeur ?? ''}
                    onChange={(e) => mettreAJour(i, 'telephone_payeur', e.target.value || null)}
                    placeholder="N° du payeur +243…"
                    className="w-full px-3 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
                  />
                  <input
                    type="text"
                    value={ligne.reference_mm ?? ''}
                    onChange={(e) => mettreAJour(i, 'reference_mm', e.target.value || null)}
                    placeholder="Réf. transaction (optionnel)"
                    className="w-full px-3 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Ajouter une ligne de paiement */}
          <button
            onClick={ajouterLigne}
            className="w-full py-2 border border-dashed border-accent text-xs text-muted hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Ajouter un mode de paiement
          </button>

          {/* Option acompte */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={estAcompte}
              onChange={(e) => setEstAcompte(e.target.checked)}
              className="w-4 h-4 accent-black"
            />
            <span className="text-xs font-bold uppercase tracking-wider">
              Enregistrer comme acompte (paiement partiel)
            </span>
          </label>

          {/* Avertissement solde */}
          {estAcompte && solde > 0 && (
            <div className="flex items-center gap-2 bg-[#FFF3E0] border border-[#F57C00] p-2 text-xs text-[#E65100]">
              <AlertCircle size={14} />
              Solde restant dû : {formatCDF(solde)}
            </div>
          )}
        </div>

        {/* Récapitulatif et bouton */}
        <div className="px-5 pb-5 flex-shrink-0 border-t border-accent pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Total à payer</span>
            <span className="font-bold">{formatCDF(total)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Montant reçu</span>
            <span className={`font-bold ${totalPaye >= total ? 'text-green-600' : 'text-[#F57C00]'}`}>
              {formatCDF(totalPaye)}
            </span>
          </div>
          {rendu > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted">Monnaie à rendre</span>
              <span className="font-black text-green-600">{formatCDF(rendu)}</span>
            </div>
          )}

          <button
            onClick={() => onConfirmer(lignes, estAcompte)}
            disabled={!peutValider}
            className="w-full py-3 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {estAcompte ? `Valider l'acompte (${formatCDF(totalPaye)})` : 'Confirmer la vente'}
          </button>
        </div>
      </div>
    </div>
  )
}
