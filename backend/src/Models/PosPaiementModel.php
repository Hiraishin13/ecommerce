<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class PosPaiementModel extends Model
{
    protected string $table = 'pos_paiements';

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO pos_paiements
             (vente_id, mode, montant, operateur, reference_mm, telephone_payeur,
              est_acompte, statut, note)
             VALUES
             (:vente_id, :mode, :montant, :operateur, :reference_mm, :telephone_payeur,
              :est_acompte, :statut, :note)'
        );

        $stmt->execute([
            ':vente_id'          => $data['vente_id'],
            ':mode'              => $data['mode'],
            ':montant'           => $data['montant'],
            ':operateur'         => $data['operateur']         ?? null,
            ':reference_mm'      => $data['reference_mm']      ?? null,
            ':telephone_payeur'  => $data['telephone_payeur']  ?? null,
            ':est_acompte'       => $data['est_acompte']       ?? 0,
            ':statut'            => $data['statut']            ?? 'confirme',
            ':note'              => $data['note']              ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findByVente(int $venteId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM pos_paiements WHERE vente_id = ? ORDER BY created_at'
        );
        $stmt->execute([$venteId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function totalConfirmeByVente(int $venteId): float
    {
        $stmt = $this->db->prepare(
            "SELECT COALESCE(SUM(montant), 0)
             FROM pos_paiements
             WHERE vente_id = ? AND statut = 'confirme'"
        );
        $stmt->execute([$venteId]);
        return (float) $stmt->fetchColumn();
    }

    /** Rapport par mode de paiement sur une période */
    public function rapportModes(string $dateDebut, string $dateFin): array
    {
        $stmt = $this->db->prepare(
            "SELECT p.mode,
                    COALESCE(p.operateur, '') AS operateur,
                    COUNT(*)                  AS nb_transactions,
                    SUM(p.montant)            AS total
             FROM pos_paiements p
             INNER JOIN pos_ventes v ON v.id = p.vente_id
             WHERE p.statut = 'confirme'
               AND v.statut NOT IN ('annulee', 'remboursee')
               AND DATE(p.created_at) BETWEEN ? AND ?
             GROUP BY p.mode, p.operateur
             ORDER BY total DESC"
        );
        $stmt->execute([$dateDebut, $dateFin]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
