import { useRef } from 'react'
import { Printer, MessageCircle, X, CheckCircle } from 'lucide-react'
import { formatCDF } from '../../../../utils/formatCDF'
import type { VentePOS } from '../../../../services/pos.service'

interface Props {
  vente:      VentePOS
  onNouvelle: () => void
}

const ENSEIGNE = 'SHOP'
const ADRESSE  = 'Kinshasa, RDC'

export default function PosTicketImpression({ vente, onNouvelle }: Props) {
  const ticketRef = useRef<HTMLDivElement>(null)

  // ── Impression 80mm ───────────────────────────────────────────────────────
  const imprimer = () => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #ticket-80mm, #ticket-80mm * { display: block !important; }
        #ticket-80mm {
          position: fixed; top: 0; left: 0;
          width: 80mm; font-family: monospace; font-size: 11px;
          color: #000; background: #fff; padding: 4mm;
        }
        @page { width: 80mm; margin: 0; }
      }
    `
    document.head.appendChild(style)
    window.print()
    document.head.removeChild(style)
  }

  // ── Lien WhatsApp ─────────────────────────────────────────────────────────
  const ouvrirWhatsApp = () => {
    const tel = vente.client_telephone?.replace(/[^0-9]/g, '') ?? ''
    if (!tel) {
      alert('Aucun numéro de téléphone client enregistré.')
      return
    }
    const date    = new Date(vente.created_at).toLocaleDateString('fr-FR')
    const heure   = new Date(vente.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const lignes  = vente.articles.map(
      (a) =>
        `• ${a.nom_produit}${a.taille ? ` (${a.taille}` : ''}${a.couleur ? `/${a.couleur})` : ''} ×${a.quantite} = ${formatCDF(a.sous_total)}`
    )
    const modes = vente.paiements
      .map((p) => `${p.mode === 'mobile_money' ? p.operateur?.toUpperCase() ?? 'MoMo' : p.mode.toUpperCase()}: ${formatCDF(p.montant)}`)
      .join('\n')

    const message =
      `🧾 *TICKET — ${ENSEIGNE}*\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `N° ${vente.numero_vente}\n` +
      `📅 ${date} à ${heure}\n` +
      (vente.client_nom ? `👤 ${vente.client_nom}\n` : '') +
      `━━━━━━━━━━━━━━━━\n` +
      `*ARTICLES*\n${lignes.join('\n')}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      (vente.remise_montant > 0 ? `🎁 Remise: -${formatCDF(vente.remise_montant)}\n` : '') +
      `*TOTAL: ${formatCDF(vente.total)}*\n\n` +
      `*PAIEMENT*\n${modes}\n` +
      (vente.solde_restant > 0 ? `⚠️ Solde dû: ${formatCDF(vente.solde_restant)}\n` : '') +
      `━━━━━━━━━━━━━━━━\n` +
      `Merci pour votre confiance ! 🙏`

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-sm shadow-2xl">

        {/* Succès */}
        <div className="flex flex-col items-center py-6 px-5 border-b border-accent">
          <CheckCircle size={40} className="text-green-600 mb-2" />
          <p className="text-sm font-black uppercase tracking-wider">Vente enregistrée !</p>
          <p className="text-xs text-muted mt-0.5">N° {vente.numero_vente}</p>
        </div>

        {/* Ticket visuel 80mm */}
        <div
          id="ticket-80mm"
          ref={ticketRef}
          className="mx-auto p-4 font-mono text-[11px] leading-snug text-black"
          style={{ width: '100%', maxWidth: '302px' }}
        >
          {/* En-tête */}
          <div className="text-center mb-2">
            <p className="font-bold text-sm">{ENSEIGNE}</p>
            <p>{ADRESSE}</p>
            <p className="border-t border-dashed border-black mt-1 pt-1">
              {new Date(vente.created_at).toLocaleDateString('fr-FR')}{' '}
              {new Date(vente.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p>N° {vente.numero_vente}</p>
            {vente.client_nom && <p>Client: {vente.client_nom}</p>}
            <p>Caissier: {vente.caissier_nom}</p>
          </div>

          <div className="border-t border-dashed border-black my-1" />

          {/* Articles */}
          {vente.articles.map((a, i) => (
            <div key={i} className="mb-1">
              <p className="font-bold">{a.nom_produit}</p>
              {(a.taille || a.couleur) && (
                <p className="text-muted">
                  {[a.taille, a.couleur].filter(Boolean).join(' / ')}
                </p>
              )}
              <div className="flex justify-between">
                <span>{formatCDF(a.prix_unitaire)} × {a.quantite}</span>
                <span className="font-bold">{formatCDF(a.sous_total)}</span>
              </div>
              {a.remise_ligne > 0 && (
                <p className="text-right">Remise: -{formatCDF(a.remise_ligne)}</p>
              )}
            </div>
          ))}

          <div className="border-t border-dashed border-black my-1" />

          {/* Totaux */}
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatCDF(vente.sous_total)}</span>
          </div>
          {vente.remise_montant > 0 && (
            <div className="flex justify-between">
              <span>Remise {vente.remise_pct > 0 ? `(${vente.remise_pct}%)` : ''}</span>
              <span>-{formatCDF(vente.remise_montant)}</span>
            </div>
          )}
          {vente.frais_livraison > 0 && (
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatCDF(vente.frais_livraison)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-black pt-1 mt-1 text-sm">
            <span>TOTAL</span>
            <span>{formatCDF(vente.total)}</span>
          </div>

          {/* Paiements */}
          <div className="border-t border-dashed border-black my-1" />
          {vente.paiements.map((p, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {p.mode === 'mobile_money'
                  ? (p.operateur?.toUpperCase() ?? 'Mobile Money')
                  : p.mode.toUpperCase()}
              </span>
              <span>{formatCDF(p.montant)}</span>
            </div>
          ))}
          {vente.solde_restant > 0 && (
            <div className="flex justify-between font-bold text-red-600 mt-1">
              <span>SOLDE DÛ</span>
              <span>{formatCDF(vente.solde_restant)}</span>
            </div>
          )}

          {/* Pied */}
          <div className="border-t border-dashed border-black mt-2 pt-2 text-center">
            <p>Merci pour votre achat !</p>
            <p>Kinshasa — {ENSEIGNE}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={imprimer}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              <Printer size={14} />
              Imprimer
            </button>
            <button
              onClick={ouvrirWhatsApp}
              disabled={!vente.client_telephone}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-[#25D366] text-[#25D366] text-xs font-bold uppercase tracking-wider hover:bg-[#25D366] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          </div>
          <button
            onClick={onNouvelle}
            className="w-full py-2.5 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-[#222] transition-colors"
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    </div>
  )
}
