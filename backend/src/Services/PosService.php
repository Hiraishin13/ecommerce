<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PosVenteModel;
use App\Models\PosPaiementModel;
use App\Models\ProduitVarianteModel;
use App\Models\ProductModel;
use RuntimeException;

class PosService
{
    private PosVenteModel        $ventes;
    private PosPaiementModel     $paiements;
    private ProduitVarianteModel $variantes;
    private ProductModel         $produits;

    public function __construct()
    {
        $this->ventes    = new PosVenteModel();
        $this->paiements = new PosPaiementModel();
        $this->variantes = new ProduitVarianteModel();
        $this->produits  = new ProductModel();
    }

    /**
     * Crée une vente POS complète avec articles et paiements.
     *
     * @param int   $caissier_id   ID du caissier connecté
     * @param array $data          {articles, paiements, client_*, remise_*, canal, notes}
     */
    public function creerVente(int $caissier_id, array $data): array
    {
        if (empty($data['articles'])) {
            throw new RuntimeException('Le panier est vide.', 400);
        }

        // ── Valider et résoudre chaque article ─────────────────────────────
        $lignes    = [];
        $sousTotal = 0.0;

        foreach ($data['articles'] as $item) {
            $produitId  = (int) ($item['produit_id'] ?? 0);
            $varianteId = isset($item['variante_id']) ? (int) $item['variante_id'] : null;
            $quantite   = max(1, (int) ($item['quantite'] ?? 1));
            $remiseLigne = (float) ($item['remise_ligne'] ?? 0);

            if ($produitId === 0) {
                throw new RuntimeException('Article invalide dans le panier.', 400);
            }

            $produit = $this->produits->findById($produitId);
            if (!$produit) {
                throw new RuntimeException("Produit introuvable (id: {$produitId}).", 404);
            }

            $prixUnitaire = (float) $produit['price'];
            $taille       = $item['taille']  ?? null;
            $couleur      = $item['couleur'] ?? null;

            // Vérifier stock et prix via variante
            if ($varianteId) {
                $variante = $this->variantes->findById($varianteId);
                if ($variante) {
                    if ($variante['prix'] !== null) {
                        $prixUnitaire = (float) $variante['prix'];
                    }
                    $taille  = $variante['taille'];
                    $couleur = $variante['couleur'];

                    if ((int) $variante['stock'] < $quantite) {
                        throw new RuntimeException(
                            "Stock insuffisant pour « {$produit['name']} » ({$taille} / {$couleur}). "
                            . "Disponible : {$variante['stock']}.",
                            400
                        );
                    }
                }
            } else {
                // Vérifier stock produit simple
                if ((int) $produit['stock'] < $quantite && !(bool) $produit['a_des_variantes']) {
                    throw new RuntimeException(
                        "Stock insuffisant pour « {$produit['name']} ». "
                        . "Disponible : {$produit['stock']}.",
                        400
                    );
                }
            }

            $sousLigne  = round(($prixUnitaire * $quantite) - $remiseLigne, 2);
            $sousTotal += $sousLigne;

            $lignes[] = [
                'produit_id'    => $produitId,
                'variante_id'   => $varianteId,
                'nom_produit'   => $produit['name'],
                'sku'           => $produit['sku'] ?? null,
                'taille'        => $taille,
                'couleur'       => $couleur,
                'prix_unitaire' => $prixUnitaire,
                'quantite'      => $quantite,
                'remise_ligne'  => $remiseLigne,
                'sous_total'    => $sousLigne,
            ];
        }

        // ── Calculer les totaux ─────────────────────────────────────────────
        $remisePct     = max(0, min(100, (float) ($data['remise_pct'] ?? 0)));
        $remiseMontant = $remisePct > 0
            ? round($sousTotal * $remisePct / 100, 2)
            : (float) ($data['remise_montant'] ?? 0);
        $fraisLivraison = (float) ($data['frais_livraison'] ?? 0);
        $total          = round($sousTotal - $remiseMontant + $fraisLivraison, 2);

        // ── Analyser les paiements ──────────────────────────────────────────
        $paiementsData = array_filter(
            $data['paiements'] ?? [],
            fn($p) => (float) ($p['montant'] ?? 0) > 0
        );

        $totalPaye  = 0.0;
        $aUnAcompte = false;
        $modes      = [];

        foreach ($paiementsData as $p) {
            $totalPaye += (float) $p['montant'];
            if (!in_array($p['mode'], $modes, true)) {
                $modes[] = $p['mode'];
            }
            if (!empty($p['est_acompte'])) {
                $aUnAcompte = true;
            }
        }
        $totalPaye    = min(round($totalPaye, 2), $total);
        $soldeRestant = round($total - $totalPaye, 2);

        $statut = match (true) {
            $soldeRestant <= 0 => 'payee',
            $totalPaye > 0    => 'partiellement_payee',
            default            => 'confirmee',
        };

        // ── Persister la vente ─────────────────────────────────────────────
        $numero  = $this->ventes->genererNumero();
        $venteId = $this->ventes->create([
            'numero_vente'      => $numero,
            'canal'             => $data['canal']            ?? 'caisse',
            'statut'            => $statut,
            'client_id'         => $data['client_id']        ?? null,
            'client_nom'        => $data['client_nom']       ?? null,
            'client_telephone'  => $data['client_telephone'] ?? null,
            'caissier_id'       => $caissier_id,
            'sous_total'        => $sousTotal,
            'remise_montant'    => $remiseMontant,
            'remise_pct'        => $remisePct,
            'frais_livraison'   => $fraisLivraison,
            'total'             => $total,
            'total_paye'        => $totalPaye,
            'solde_restant'     => $soldeRestant,
            'a_une_avance'      => $aUnAcompte ? 1 : 0,
            'modes_paiement'    => empty($modes) ? null : implode(',', $modes),
            'notes'             => $data['notes'] ?? null,
        ]);

        // Articles
        $this->ventes->insererArticles($venteId, $lignes);

        // Décrémenter les stocks
        foreach ($lignes as $ligne) {
            if ($ligne['variante_id']) {
                $this->variantes->decrementerStock($ligne['variante_id'], $ligne['quantite']);
                $this->variantes->syncStockProduit($ligne['produit_id']);
            } else {
                $this->produits->decrementStock($ligne['produit_id'], $ligne['quantite']);
            }
        }

        // Paiements
        foreach ($paiementsData as $p) {
            $this->paiements->create([
                'vente_id'         => $venteId,
                'mode'             => $p['mode'],
                'montant'          => (float) $p['montant'],
                'operateur'        => $p['operateur']        ?? null,
                'reference_mm'     => $p['reference_mm']     ?? null,
                'telephone_payeur' => $p['telephone_payeur'] ?? null,
                'est_acompte'      => !empty($p['est_acompte']) ? 1 : 0,
                'statut'           => 'confirme',
                'note'             => $p['note']             ?? null,
            ]);
        }

        return $this->ventes->findById($venteId);
    }

    /**
     * Ajouter un paiement sur une vente existante (solde d'acompte).
     */
    public function ajouterPaiement(int $venteId, array $paiement): array
    {
        $vente = $this->ventes->findById($venteId);
        if (!$vente) {
            throw new RuntimeException('Vente introuvable.', 404);
        }
        if (in_array($vente['statut'], ['payee', 'annulee', 'remboursee'], true)) {
            throw new RuntimeException('Cette vente ne peut plus recevoir de paiement.', 400);
        }

        $montant = (float) ($paiement['montant'] ?? 0);
        if ($montant <= 0) {
            throw new RuntimeException('Montant invalide.', 400);
        }
        // Plafonner au solde restant
        $montant = min($montant, (float) $vente['solde_restant']);

        $this->paiements->create([
            'vente_id'         => $venteId,
            'mode'             => $paiement['mode'],
            'montant'          => $montant,
            'operateur'        => $paiement['operateur']        ?? null,
            'reference_mm'     => $paiement['reference_mm']     ?? null,
            'telephone_payeur' => $paiement['telephone_payeur'] ?? null,
            'est_acompte'      => 0,
            'statut'           => 'confirme',
            'note'             => $paiement['note'] ?? null,
        ]);

        $totalPaye    = $this->paiements->totalConfirmeByVente($venteId);
        $soldeRestant = round((float) $vente['total'] - $totalPaye, 2);
        $statut       = $soldeRestant <= 0 ? 'payee' : 'partiellement_payee';

        $tousPaiements = $this->paiements->findByVente($venteId);
        $modes         = array_unique(array_column($tousPaiements, 'mode'));

        $this->ventes->updatePaiement(
            $venteId,
            $totalPaye,
            max(0.0, $soldeRestant),
            implode(',', $modes),
            $statut,
            (int) $vente['a_une_avance']
        );

        return $this->ventes->findById($venteId);
    }
}
