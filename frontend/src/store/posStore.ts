import { create } from 'zustand'

// ── Types ──────────────────────────────────────────────────────────────────

export interface PosArticle {
  produit_id:   number
  variante_id?: number | null
  nom_produit:  string
  sku?:         string | null
  taille?:      string | null
  couleur?:     string | null
  prix_unitaire: number
  quantite:     number
  remise_ligne: number
  sous_total:   number
  // pour affichage uniquement
  image?:       string | null
}

export interface PosClient {
  client_id?:       number | null
  client_nom:       string
  client_telephone: string
}

export interface PosPaiementLigne {
  mode:              'cash' | 'mobile_money' | 'carte' | 'virement' | 'credit'
  montant:           number
  operateur?:        string | null
  reference_mm?:     string | null
  telephone_payeur?: string | null
  est_acompte:       boolean
  note?:             string | null
}

export type CanalVente = 'caisse' | 'whatsapp' | 'telephone'

// ── Store ──────────────────────────────────────────────────────────────────

interface PosState {
  articles:        PosArticle[]
  client:          PosClient | null
  remise_pct:      number
  remise_montant:  number
  frais_livraison: number
  canal:           CanalVente
  notes:           string

  // Actions articles
  ajouterArticle:    (article: PosArticle) => void
  supprimerArticle:  (index: number) => void
  mettreQuantite:    (index: number, quantite: number) => void
  mettreRemiseLigne: (index: number, remise: number) => void

  // Actions globales
  setClient:          (client: PosClient | null) => void
  setRemisePct:       (pct: number) => void
  setRemiseMontant:   (montant: number) => void
  setFraisLivraison:  (frais: number) => void
  setCanal:           (canal: CanalVente) => void
  setNotes:           (notes: string) => void
  reinitialiser:      () => void

  // Computed (impure — appelés dans le composant)
  sousTotal:      () => number
  totalRemise:    () => number
  total:          () => number
}

function calculerSousTotal(article: PosArticle): number {
  return Math.max(0, article.prix_unitaire * article.quantite - article.remise_ligne)
}

export const usePosStore = create<PosState>()((set, get) => ({
  articles:        [],
  client:          null,
  remise_pct:      0,
  remise_montant:  0,
  frais_livraison: 0,
  canal:           'caisse',
  notes:           '',

  // ── Articles ─────────────────────────────────────────────────────────────

  ajouterArticle: (article) =>
    set((state) => {
      // Incrémenter la quantité si le même article (produit + variante) existe déjà
      const idx = state.articles.findIndex(
        (a) =>
          a.produit_id === article.produit_id &&
          (a.variante_id ?? null) === (article.variante_id ?? null)
      )

      if (idx !== -1) {
        const mis_a_jour = state.articles.map((a, i) => {
          if (i !== idx) return a
          const q = a.quantite + article.quantite
          return { ...a, quantite: q, sous_total: calculerSousTotal({ ...a, quantite: q }) }
        })
        return { articles: mis_a_jour }
      }

      const nouvel = { ...article, sous_total: calculerSousTotal(article) }
      return { articles: [...state.articles, nouvel] }
    }),

  supprimerArticle: (index) =>
    set((state) => ({
      articles: state.articles.filter((_, i) => i !== index),
    })),

  mettreQuantite: (index, quantite) =>
    set((state) => ({
      articles: state.articles.map((a, i) => {
        if (i !== index) return a
        const q = Math.max(1, quantite)
        return { ...a, quantite: q, sous_total: calculerSousTotal({ ...a, quantite: q }) }
      }),
    })),

  mettreRemiseLigne: (index, remise) =>
    set((state) => ({
      articles: state.articles.map((a, i) => {
        if (i !== index) return a
        return { ...a, remise_ligne: remise, sous_total: calculerSousTotal({ ...a, remise_ligne: remise }) }
      }),
    })),

  // ── Globales ──────────────────────────────────────────────────────────────

  setClient:         (client) => set({ client }),
  setRemisePct:      (pct) => set({ remise_pct: Math.max(0, Math.min(100, pct)), remise_montant: 0 }),
  setRemiseMontant:  (montant) => set({ remise_montant: Math.max(0, montant), remise_pct: 0 }),
  setFraisLivraison: (frais) => set({ frais_livraison: Math.max(0, frais) }),
  setCanal:          (canal) => set({ canal }),
  setNotes:          (notes) => set({ notes }),

  reinitialiser: () =>
    set({
      articles:        [],
      client:          null,
      remise_pct:      0,
      remise_montant:  0,
      frais_livraison: 0,
      canal:           'caisse',
      notes:           '',
    }),

  // ── Computed ──────────────────────────────────────────────────────────────

  sousTotal: () =>
    get().articles.reduce((acc, a) => acc + a.sous_total, 0),

  totalRemise: () => {
    const st = get().sousTotal()
    const { remise_pct, remise_montant } = get()
    return remise_pct > 0 ? Math.round(st * remise_pct / 100) : remise_montant
  },

  total: () => {
    const st = get().sousTotal()
    return Math.max(0, st - get().totalRemise() + get().frais_livraison)
  },
}))
