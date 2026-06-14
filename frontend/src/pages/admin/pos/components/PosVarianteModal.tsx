import { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { posService, type ProduitCaisse, type VarianteProduit } from '../../../../services/pos.service'
import { formatCDF } from '../../../../utils/formatCDF'
import type { PosArticle } from '../../../../store/posStore'

interface Props {
  produit:    ProduitCaisse
  onAjouter:  (article: PosArticle) => void
  onFermer:   () => void
}

function parseImages(raw: string | null): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed[0] ?? null : null
  } catch {
    return raw.startsWith('http') ? raw : null
  }
}

export default function PosVarianteModal({ produit, onAjouter, onFermer }: Props) {
  const [variantes, setVariantes]   = useState<VarianteProduit[]>([])
  const [loading, setLoading]       = useState(true)
  const [tailleChoisie, setTaille]  = useState<string | null>(null)
  const [couleurChoisie, setCouleur] = useState<string | null>(null)
  const [quantite, setQuantite]     = useState(1)

  useEffect(() => {
    posService.getVariantes(produit.id)
      .then(setVariantes)
      .finally(() => setLoading(false))
  }, [produit.id])

  const tailles  = [...new Set(variantes.map((v) => v.taille).filter(Boolean))] as string[]
  const couleurs = [...new Set(variantes.map((v) => v.couleur).filter(Boolean))] as string[]

  const varianteSelectionnee = variantes.find(
    (v) =>
      (tailles.length === 0 || v.taille === tailleChoisie) &&
      (couleurs.length === 0 || v.couleur === couleurChoisie)
  ) ?? null

  const prixAffiche = varianteSelectionnee?.prix ?? produit.price
  const stockDispo  = varianteSelectionnee?.stock ?? 0

  const peutAjouter =
    (tailles.length === 0 || tailleChoisie !== null) &&
    (couleurs.length === 0 || couleurChoisie !== null) &&
    (varianteSelectionnee ? stockDispo >= quantite : true)

  const handleAjouter = () => {
    if (!peutAjouter) return
    onAjouter({
      produit_id:    produit.id,
      variante_id:   varianteSelectionnee?.id ?? null,
      nom_produit:   produit.name,
      sku:           varianteSelectionnee?.sku ?? produit.sku ?? null,
      taille:        tailleChoisie,
      couleur:       couleurChoisie,
      prix_unitaire: prixAffiche,
      quantite,
      remise_ligne:  0,
      sous_total:    prixAffiche * quantite,
      image:         parseImages(produit.images),
    })
    onFermer()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-md shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-accent">
          <div>
            <p className="text-xs font-black uppercase tracking-wider">{produit.name}</p>
            <p className="text-xs text-muted">{formatCDF(prixAffiche)}</p>
          </div>
          <button onClick={onFermer} className="p-1 hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted" />
            </div>
          ) : (
            <>
              {/* Sélection taille */}
              {tailles.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2">Taille</p>
                  <div className="flex flex-wrap gap-2">
                    {tailles.map((t) => {
                      const dispo = variantes
                        .filter((v) => v.taille === t && (!couleurChoisie || v.couleur === couleurChoisie))
                        .some((v) => v.stock > 0)
                      return (
                        <button
                          key={t}
                          disabled={!dispo}
                          onClick={() => setTaille(t === tailleChoisie ? null : t)}
                          className={`px-3 py-1.5 text-xs font-bold border-2 transition-colors ${
                            t === tailleChoisie
                              ? 'bg-black text-white border-black'
                              : dispo
                              ? 'border-accent hover:border-black'
                              : 'border-accent text-muted line-through cursor-not-allowed'
                          }`}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Sélection couleur */}
              {couleurs.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2">Couleur</p>
                  <div className="flex flex-wrap gap-2">
                    {couleurs.map((c) => {
                      const v = variantes.find(
                        (v) => v.couleur === c && (!tailleChoisie || v.taille === tailleChoisie)
                      )
                      const hex   = v?.couleur_hex ?? null
                      const dispo = (v?.stock ?? 0) > 0
                      return (
                        <button
                          key={c}
                          disabled={!dispo}
                          onClick={() => setCouleur(c === couleurChoisie ? null : c)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 transition-colors ${
                            c === couleurChoisie
                              ? 'bg-black text-white border-black'
                              : dispo
                              ? 'border-accent hover:border-black'
                              : 'border-accent text-muted line-through cursor-not-allowed'
                          }`}
                        >
                          {hex && (
                            <span
                              className="inline-block w-3 h-3 rounded-full border border-white/30"
                              style={{ background: hex }}
                            />
                          )}
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Stock de la variante sélectionnée */}
              {varianteSelectionnee && (
                <p className={`text-xs ${stockDispo <= 3 ? 'text-red-500' : 'text-muted'}`}>
                  Stock disponible : {stockDispo}
                </p>
              )}

              {/* Quantité */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2">Quantité</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 border border-accent flex items-center justify-center text-lg font-bold hover:bg-accent transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-black w-8 text-center">{quantite}</span>
                  <button
                    onClick={() => setQuantite((q) => q + 1)}
                    disabled={varianteSelectionnee ? quantite >= stockDispo : false}
                    className="w-8 h-8 border border-accent flex items-center justify-center text-lg font-bold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-[#FAFAFA] p-3 border border-accent">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Sous-total</span>
                  <span className="font-black">{formatCDF(prixAffiche * quantite)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bouton ajouter */}
        <div className="px-5 pb-5">
          <button
            onClick={handleAjouter}
            disabled={!peutAjouter || loading}
            className="w-full py-3 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  )
}
