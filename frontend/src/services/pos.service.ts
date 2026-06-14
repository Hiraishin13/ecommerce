import api from './api'
import type { PosArticle, PosClient, PosPaiementLigne, CanalVente } from '../store/posStore'

// ── Types retournés par l'API ──────────────────────────────────────────────

export interface ProduitCaisse {
  id:               number
  name:             string
  slug:             string
  sku:              string | null
  price:            number
  stock:            number
  images:           string | null
  a_des_variantes:  number
  category_name:    string | null
}

export interface VarianteProduit {
  id:          number
  produit_id:  number
  taille:      string | null
  couleur:     string | null
  couleur_hex: string | null
  sku:         string | null
  prix:        number | null
  stock:       number
}

export interface VentePOS {
  id:               number
  numero_vente:     string
  canal:            string
  statut:           string
  client_id:        number | null
  client_nom:       string | null
  client_telephone: string | null
  caissier_id:      number
  caissier_nom:     string
  sous_total:       number
  remise_montant:   number
  remise_pct:       number
  frais_livraison:  number
  total:            number
  total_paye:       number
  solde_restant:    number
  a_une_avance:     number
  modes_paiement:   string | null
  notes:            string | null
  created_at:       string
  articles:         ArticleVente[]
  paiements:        PaiementVente[]
}

export interface ArticleVente {
  id:            number
  nom_produit:   string
  sku:           string | null
  taille:        string | null
  couleur:       string | null
  prix_unitaire: number
  quantite:      number
  remise_ligne:  number
  sous_total:    number
}

export interface PaiementVente {
  id:               number
  mode:             string
  montant:          number
  operateur:        string | null
  reference_mm:     string | null
  telephone_payeur: string | null
  est_acompte:      number
  statut:           string
  created_at:       string
}

export interface PayloadCreerVente {
  articles:        PosArticle[]
  paiements:       PosPaiementLigne[]
  canal:           CanalVente
  client:          PosClient | null
  remise_pct:      number
  remise_montant:  number
  frais_livraison: number
  notes:           string
}

// ── Service ────────────────────────────────────────────────────────────────

export const posService = {

  async rechercherProduits(q: string): Promise<ProduitCaisse[]> {
    if (!q.trim()) return []
    const { data } = await api.get<{ produits: ProduitCaisse[] }>(
      '/admin/pos/recherche',
      { params: { q, limit: 12 } }
    )
    return data.produits ?? []
  },

  async getVariantes(produitId: number): Promise<VarianteProduit[]> {
    const { data } = await api.get<{ variantes: VarianteProduit[] }>(
      `/admin/pos/produits/${produitId}/variantes`
    )
    return data.variantes ?? []
  },

  async creerVente(payload: PayloadCreerVente): Promise<VentePOS> {
    const body = {
      articles: payload.articles.map((a) => ({
        produit_id:   a.produit_id,
        variante_id:  a.variante_id ?? null,
        taille:       a.taille      ?? null,
        couleur:      a.couleur     ?? null,
        quantite:     a.quantite,
        remise_ligne: a.remise_ligne,
      })),
      paiements: payload.paiements.map((p) => ({
        mode:              p.mode,
        montant:           p.montant,
        operateur:         p.operateur        ?? null,
        reference_mm:      p.reference_mm     ?? null,
        telephone_payeur:  p.telephone_payeur ?? null,
        est_acompte:       p.est_acompte ? 1 : 0,
        note:              p.note             ?? null,
      })),
      canal:            payload.canal,
      client_id:        payload.client?.client_id     ?? null,
      client_nom:       payload.client?.client_nom    ?? null,
      client_telephone: payload.client?.client_telephone ?? null,
      remise_pct:       payload.remise_pct,
      remise_montant:   payload.remise_montant,
      frais_livraison:  payload.frais_livraison,
      notes:            payload.notes,
    }
    const { data } = await api.post<{ vente: VentePOS }>('/admin/pos/ventes', body)
    return data.vente
  },

  async ajouterPaiement(venteId: number, paiement: PosPaiementLigne): Promise<VentePOS> {
    const { data } = await api.post<{ vente: VentePOS }>(
      `/admin/pos/ventes/${venteId}/paiement`,
      paiement
    )
    return data.vente
  },

  async genererLienWhatsApp(venteId: number, telephone: string): Promise<string> {
    const { data } = await api.post<{ lien_whatsapp: string }>(
      `/admin/pos/ventes/${venteId}/whatsapp`,
      { telephone }
    )
    return data.lien_whatsapp
  },

  async getVente(id: number): Promise<VentePOS> {
    const { data } = await api.get<{ vente: VentePOS }>(`/admin/pos/ventes/${id}`)
    return data.vente
  },
}
