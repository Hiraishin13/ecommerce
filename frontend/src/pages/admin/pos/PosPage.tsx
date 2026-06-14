import { useState } from 'react'
import { Trash2, Minus, Plus, ShoppingCart, Tag, Truck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePosStore, type PosArticle, type PosPaiementLigne } from '../../../store/posStore'
import { posService, type ProduitCaisse, type VentePOS } from '../../../services/pos.service'
import { formatCDF } from '../../../utils/formatCDF'
import PosRechercheProduit  from './components/PosRechercheProduit'
import PosVarianteModal     from './components/PosVarianteModal'
import PosClientPanel       from './components/PosClientPanel'
import PosPaiementModal     from './components/PosPaiementModal'
import PosTicketImpression  from './components/PosTicketImpression'

// ── Constantes ─────────────────────────────────────────────────────────────

const CANAUX = [
  { value: 'caisse',    label: 'Caisse' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'telephone', label: 'Téléphone' },
] as const

// ── Page principale ────────────────────────────────────────────────────────

export default function PosPage() {
  const store = usePosStore()

  // Modales
  const [produitPourVariante, setProduitPourVariante] = useState<ProduitCaisse | null>(null)
  const [paiementOuvert, setPaiementOuvert]           = useState(false)
  const [venteCreee, setVenteCreee]                   = useState<VentePOS | null>(null)
  const [enCours, setEnCours]                         = useState(false)

  // ── Sélection produit depuis la recherche ─────────────────────────────
  const handleSelectProduit = (produit: ProduitCaisse) => {
    if (produit.a_des_variantes) {
      setProduitPourVariante(produit)
    } else {
      let img: string | null = null
      try {
        const parsed = produit.images ? JSON.parse(produit.images) : null
        img = Array.isArray(parsed) ? parsed[0] ?? null : null
      } catch { /* ignore */ }

      store.ajouterArticle({
        produit_id:    produit.id,
        variante_id:   null,
        nom_produit:   produit.name,
        sku:           produit.sku,
        taille:        null,
        couleur:       null,
        prix_unitaire: produit.price,
        quantite:      1,
        remise_ligne:  0,
        sous_total:    produit.price,
        image:         img,
      })
    }
  }

  // ── Confirmation paiement → création vente ────────────────────────────
  const handleConfirmerPaiement = async (
    paiements: PosPaiementLigne[],
    estAcompte: boolean
  ) => {
    setEnCours(true)
    try {
      const vente = await posService.creerVente({
        articles:        store.articles,
        paiements:       paiements.map((p) => ({ ...p, est_acompte: estAcompte && paiements.indexOf(p) === 0 })),
        canal:           store.canal,
        client:          store.client,
        remise_pct:      store.remise_pct,
        remise_montant:  store.remise_montant,
        frais_livraison: store.frais_livraison,
        notes:           store.notes,
      })
      setPaiementOuvert(false)
      setVenteCreee(vente)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création de la vente.'
      toast.error(msg)
    } finally {
      setEnCours(false)
    }
  }

  // ── Nouvelle vente ────────────────────────────────────────────────────
  const nouvelleVente = () => {
    store.reinitialiser()
    setVenteCreee(null)
  }

  const sousTotal  = store.sousTotal()
  const remise     = store.totalRemise()
  const total      = store.total()
  const nbArticles = store.articles.reduce((acc, a) => acc + a.quantite, 0)

  // ── Rendu ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] gap-0 -m-6">

      {/* ── Colonne gauche : recherche ──────────────────────────────────── */}
      <div className="lg:w-[55%] flex flex-col border-r border-accent bg-white">

        {/* Barre supérieure */}
        <div className="px-4 py-3 border-b border-accent flex items-center gap-3">
          <h1 className="text-xs font-black uppercase tracking-[0.15em]">Caisse POS</h1>
          <div className="flex gap-1 ml-auto">
            {CANAUX.map((c) => (
              <button
                key={c.value}
                onClick={() => store.setCanal(c.value)}
                className={`px-2 py-1 text-[10px] font-bold border transition-colors ${
                  store.canal === c.value
                    ? 'bg-black text-white border-black'
                    : 'border-accent hover:border-black'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            onClick={nouvelleVente}
            title="Réinitialiser"
            className="p-1.5 hover:bg-accent transition-colors text-muted"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Recherche produit */}
        <div className="px-4 pt-4 pb-2">
          <PosRechercheProduit onSelectProduit={handleSelectProduit} />
        </div>

        {/* Grille rapide (produits récents / populaires) */}
        <div className="flex-1 px-4 pb-4 overflow-y-auto">
          {store.articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted">
              <ShoppingCart size={40} strokeWidth={1} className="mb-3" />
              <p className="text-xs uppercase tracking-wider">Panier vide</p>
              <p className="text-[10px] mt-1">Recherchez un produit ci-dessus (F2)</p>
            </div>
          ) : (
            <p className="text-[10px] text-muted uppercase tracking-wider">
              {nbArticles} article{nbArticles > 1 ? 's' : ''} dans le panier
            </p>
          )}
        </div>
      </div>

      {/* ── Colonne droite : panier + paiement ─────────────────────────── */}
      <div className="lg:w-[45%] flex flex-col bg-[#FAFAFA]">

        {/* Client */}
        <div className="px-4 pt-3 pb-2 border-b border-accent">
          <PosClientPanel client={store.client} onChange={store.setClient} />
        </div>

        {/* Liste articles */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {store.articles.length === 0 ? (
            <p className="text-center text-xs text-muted py-6">Aucun article</p>
          ) : (
            store.articles.map((article, i) => (
              <ArticleLigne
                key={`${article.produit_id}-${article.variante_id ?? 'none'}-${i}`}
                article={article}
                onQuantite={(q)  => store.mettreQuantite(i, q)}
                onSupprimer={() => store.supprimerArticle(i)}
                onRemise={(r)   => store.mettreRemiseLigne(i, r)}
              />
            ))
          )}
        </div>

        {/* Remise globale + frais */}
        <div className="px-4 py-2 border-t border-accent space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-1">
                <Tag size={10} /> Remise %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={store.remise_pct || ''}
                onChange={(e) => store.setRemisePct(Number(e.target.value))}
                placeholder="0"
                className="w-full px-2 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-1">
                <Tag size={10} /> Remise FC
              </label>
              <input
                type="number"
                min={0}
                value={store.remise_montant || ''}
                onChange={(e) => store.setRemiseMontant(Number(e.target.value))}
                placeholder="0"
                className="w-full px-2 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-1">
              <Truck size={10} /> Frais livraison FC
            </label>
            <input
              type="number"
              min={0}
              value={store.frais_livraison || ''}
              onChange={(e) => store.setFraisLivraison(Number(e.target.value))}
              placeholder="0"
              className="w-full px-2 py-1.5 text-xs border border-accent focus:outline-none focus:border-black bg-white"
            />
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="px-4 py-3 bg-white border-t border-accent space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Sous-total</span>
            <span>{formatCDF(sousTotal)}</span>
          </div>
          {remise > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Remise</span>
              <span>-{formatCDF(remise)}</span>
            </div>
          )}
          {store.frais_livraison > 0 && (
            <div className="flex justify-between text-xs text-muted">
              <span>Livraison</span>
              <span>+{formatCDF(store.frais_livraison)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black border-t border-black pt-2 mt-1">
            <span>TOTAL</span>
            <span>{formatCDF(total)}</span>
          </div>
        </div>

        {/* Bouton encaisser */}
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={() => setPaiementOuvert(true)}
            disabled={store.articles.length === 0 || enCours}
            className="w-full py-4 bg-black text-white font-black uppercase tracking-[0.2em] hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {enCours ? 'Traitement…' : `Encaisser — ${formatCDF(total)}`}
          </button>
        </div>
      </div>

      {/* ── Modales ──────────────────────────────────────────────────────── */}

      {produitPourVariante && (
        <PosVarianteModal
          produit={produitPourVariante}
          onAjouter={(art: PosArticle) => {
            store.ajouterArticle(art)
            setProduitPourVariante(null)
          }}
          onFermer={() => setProduitPourVariante(null)}
        />
      )}

      {paiementOuvert && (
        <PosPaiementModal
          total={total}
          onConfirmer={handleConfirmerPaiement}
          onFermer={() => setPaiementOuvert(false)}
        />
      )}

      {venteCreee && (
        <PosTicketImpression
          vente={venteCreee}
          onNouvelle={nouvelleVente}
        />
      )}
    </div>
  )
}

// ── Sous-composant : ligne article dans le panier ─────────────────────────

interface ArticleLigneProps {
  article:     PosArticle
  onQuantite:  (q: number) => void
  onSupprimer: () => void
  onRemise:    (r: number) => void
}

function ArticleLigne({ article, onQuantite, onSupprimer, onRemise }: ArticleLigneProps) {
  const varianteLabel = [article.taille, article.couleur].filter(Boolean).join(' / ')

  return (
    <div className="bg-white border border-accent p-2.5">
      <div className="flex items-start gap-2">
        {/* Miniature */}
        {article.image ? (
          <img src={article.image} alt={article.nom_produit}
            className="w-10 h-10 object-cover flex-shrink-0 bg-accent" />
        ) : (
          <div className="w-10 h-10 bg-accent flex-shrink-0" />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate leading-tight">{article.nom_produit}</p>
          {varianteLabel && (
            <p className="text-[10px] text-muted">{varianteLabel}</p>
          )}
          <p className="text-[10px] text-muted">{formatCDF(article.prix_unitaire)} / unité</p>
        </div>

        {/* Supprimer */}
        <button onClick={onSupprimer} className="p-0.5 text-muted hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Contrôles quantité + remise */}
      <div className="flex items-center gap-2 mt-2">
        {/* Quantité */}
        <div className="flex items-center border border-accent">
          <button
            onClick={() => onQuantite(article.quantite - 1)}
            className="px-2 py-1 hover:bg-accent transition-colors"
          >
            <Minus size={10} />
          </button>
          <span className="px-2 text-xs font-bold min-w-[2rem] text-center">{article.quantite}</span>
          <button
            onClick={() => onQuantite(article.quantite + 1)}
            className="px-2 py-1 hover:bg-accent transition-colors"
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Remise ligne */}
        <div className="flex items-center flex-1">
          <input
            type="number"
            min={0}
            value={article.remise_ligne || ''}
            onChange={(e) => onRemise(Math.max(0, Number(e.target.value)))}
            placeholder="Remise FC"
            className="w-full px-2 py-1 text-xs border border-accent focus:outline-none focus:border-black bg-white"
          />
        </div>

        {/* Sous-total */}
        <p className="text-xs font-black text-right min-w-[70px]">
          {formatCDF(article.sous_total)}
        </p>
      </div>
    </div>
  )
}
