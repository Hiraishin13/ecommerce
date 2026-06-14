<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class PosVenteModel extends Model
{
    protected string $table = 'pos_ventes';

    /** Génère un numéro unique VNT-YYMM-XXXXX */
    public function genererNumero(): string
    {
        $prefixe = 'VNT-' . date('ym');

        $stmt = $this->db->prepare(
            "SELECT numero_vente FROM pos_ventes
             WHERE numero_vente LIKE ?
             ORDER BY id DESC
             LIMIT 1"
        );
        $stmt->execute([$prefixe . '%']);
        $dernier = $stmt->fetchColumn();

        $sequence = $dernier
            ? (int) substr((string) $dernier, -5) + 1
            : 1;

        return $prefixe . '-' . str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO pos_ventes
             (numero_vente, canal, statut, client_id, client_nom, client_telephone,
              caissier_id, sous_total, remise_montant, remise_pct, frais_livraison,
              total, total_paye, solde_restant, a_une_avance, modes_paiement, notes)
             VALUES
             (:numero_vente, :canal, :statut, :client_id, :client_nom, :client_telephone,
              :caissier_id, :sous_total, :remise_montant, :remise_pct, :frais_livraison,
              :total, :total_paye, :solde_restant, :a_une_avance, :modes_paiement, :notes)'
        );

        $stmt->execute([
            ':numero_vente'      => $data['numero_vente'],
            ':canal'             => $data['canal']            ?? 'caisse',
            ':statut'            => $data['statut']           ?? 'confirmee',
            ':client_id'         => $data['client_id']        ?? null,
            ':client_nom'        => $data['client_nom']       ?? null,
            ':client_telephone'  => $data['client_telephone'] ?? null,
            ':caissier_id'       => $data['caissier_id'],
            ':sous_total'        => $data['sous_total'],
            ':remise_montant'    => $data['remise_montant']   ?? 0,
            ':remise_pct'        => $data['remise_pct']       ?? 0,
            ':frais_livraison'   => $data['frais_livraison']  ?? 0,
            ':total'             => $data['total'],
            ':total_paye'        => $data['total_paye']       ?? 0,
            ':solde_restant'     => $data['solde_restant']    ?? $data['total'],
            ':a_une_avance'      => $data['a_une_avance']     ?? 0,
            ':modes_paiement'    => $data['modes_paiement']   ?? null,
            ':notes'             => $data['notes']            ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function insererArticles(int $venteId, array $articles): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO pos_vente_articles
             (vente_id, produit_id, variante_id, nom_produit, sku,
              taille, couleur, prix_unitaire, quantite, remise_ligne, sous_total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        foreach ($articles as $art) {
            $stmt->execute([
                $venteId,
                $art['produit_id'],
                $art['variante_id'],
                $art['nom_produit'],
                $art['sku'],
                $art['taille'],
                $art['couleur'],
                $art['prix_unitaire'],
                $art['quantite'],
                $art['remise_ligne'],
                $art['sous_total'],
            ]);
        }
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT v.*, u.name AS caissier_nom
             FROM pos_ventes v
             LEFT JOIN users u ON u.id = v.caissier_id
             WHERE v.id = ?
             LIMIT 1'
        );
        $stmt->execute([$id]);
        $vente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($vente) {
            $vente['articles']  = $this->getArticles($id);
            $vente['paiements'] = $this->getPaiements($id);
        }

        return $vente;
    }

    private function getArticles(int $venteId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM pos_vente_articles WHERE vente_id = ? ORDER BY id'
        );
        $stmt->execute([$venteId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getPaiements(int $venteId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM pos_paiements WHERE vente_id = ? ORDER BY created_at'
        );
        $stmt->execute([$venteId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findAll(array $filtres = [], int $limit = 20, int $offset = 0): array
    {
        $conditions = ['1=1'];
        $bindings   = [];

        if (!empty($filtres['statut'])) {
            $conditions[] = 'v.statut = ?';
            $bindings[]   = $filtres['statut'];
        }
        if (!empty($filtres['canal'])) {
            $conditions[] = 'v.canal = ?';
            $bindings[]   = $filtres['canal'];
        }
        if (!empty($filtres['caissier_id'])) {
            $conditions[] = 'v.caissier_id = ?';
            $bindings[]   = (int) $filtres['caissier_id'];
        }
        if (!empty($filtres['date_debut'])) {
            $conditions[] = 'DATE(v.created_at) >= ?';
            $bindings[]   = $filtres['date_debut'];
        }
        if (!empty($filtres['date_fin'])) {
            $conditions[] = 'DATE(v.created_at) <= ?';
            $bindings[]   = $filtres['date_fin'];
        }
        if (!empty($filtres['q'])) {
            $conditions[] = '(v.numero_vente LIKE ? OR v.client_nom LIKE ? OR v.client_telephone LIKE ?)';
            $like         = '%' . $filtres['q'] . '%';
            $bindings[]   = $like;
            $bindings[]   = $like;
            $bindings[]   = $like;
        }

        $where    = implode(' AND ', $conditions);
        $bindings[] = $limit;
        $bindings[] = $offset;

        $stmt = $this->db->prepare(
            "SELECT v.*, u.name AS caissier_nom
             FROM pos_ventes v
             LEFT JOIN users u ON u.id = v.caissier_id
             WHERE {$where}
             ORDER BY v.created_at DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->execute($bindings);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(array $filtres = []): int
    {
        $conditions = ['1=1'];
        $bindings   = [];

        if (!empty($filtres['statut'])) {
            $conditions[] = 'statut = ?';
            $bindings[]   = $filtres['statut'];
        }
        if (!empty($filtres['canal'])) {
            $conditions[] = 'canal = ?';
            $bindings[]   = $filtres['canal'];
        }
        if (!empty($filtres['caissier_id'])) {
            $conditions[] = 'caissier_id = ?';
            $bindings[]   = (int) $filtres['caissier_id'];
        }

        $where = implode(' AND ', $conditions);
        $stmt  = $this->db->prepare(
            "SELECT COUNT(*) FROM pos_ventes WHERE {$where}"
        );
        $stmt->execute($bindings);
        return (int) $stmt->fetchColumn();
    }

    public function updateStatut(int $id, string $statut): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE pos_ventes SET statut = ? WHERE id = ?'
        );
        return $stmt->execute([$statut, $id]);
    }

    public function updatePaiement(
        int    $id,
        float  $totalPaye,
        float  $soldeRestant,
        string $modes,
        string $statut,
        int    $aUneAvance
    ): bool {
        $stmt = $this->db->prepare(
            'UPDATE pos_ventes
             SET total_paye = ?, solde_restant = ?, modes_paiement = ?,
                 statut = ?, a_une_avance = ?
             WHERE id = ?'
        );
        return $stmt->execute([$totalPaye, $soldeRestant, $modes, $statut, $aUneAvance, $id]);
    }

    /** Stats du jour pour le dashboard POS */
    public function statsJour(): array
    {
        $stmt = $this->db->prepare(
            "SELECT
                COUNT(*) AS nb_ventes,
                COALESCE(SUM(total), 0) AS ca_total,
                COALESCE(SUM(total_paye), 0) AS ca_encaisse,
                COALESCE(SUM(solde_restant), 0) AS ca_restant,
                COALESCE(AVG(total), 0) AS panier_moyen
             FROM pos_ventes
             WHERE DATE(created_at) = CURDATE()
               AND statut NOT IN ('annulee', 'remboursee')"
        );
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }
}
