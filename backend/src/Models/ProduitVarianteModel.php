<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class ProduitVarianteModel extends Model
{
    protected string $table = 'produit_variantes';

    public function findByProduit(int $produitId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM produit_variantes
             WHERE produit_id = ? AND est_actif = 1
             ORDER BY taille, couleur'
        );
        $stmt->execute([$produitId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO produit_variantes
             (produit_id, taille, couleur, couleur_hex, sku, prix, stock, est_actif)
             VALUES (:produit_id, :taille, :couleur, :couleur_hex, :sku, :prix, :stock, :est_actif)'
        );
        $stmt->execute([
            ':produit_id'  => $data['produit_id'],
            ':taille'      => $data['taille']      ?? null,
            ':couleur'     => $data['couleur']     ?? null,
            ':couleur_hex' => $data['couleur_hex'] ?? null,
            ':sku'         => $data['sku']         ?? null,
            ':prix'        => $data['prix']        ?? null,
            ':stock'       => $data['stock']       ?? 0,
            ':est_actif'   => $data['est_actif']   ?? 1,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $champs   = [];
        $valeurs  = [];
        $autorises = ['taille', 'couleur', 'couleur_hex', 'sku', 'prix', 'stock', 'est_actif'];

        foreach ($autorises as $champ) {
            if (array_key_exists($champ, $data)) {
                $champs[]  = "{$champ} = ?";
                $valeurs[] = $data[$champ];
            }
        }

        if (empty($champs)) {
            return false;
        }

        $valeurs[] = $id;
        $stmt = $this->db->prepare(
            'UPDATE produit_variantes SET ' . implode(', ', $champs) . ' WHERE id = ?'
        );
        return $stmt->execute($valeurs);
    }

    /** Décrémenter le stock d'une variante (minimum 0) */
    public function decrementerStock(int $id, int $quantite): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE produit_variantes
             SET stock = GREATEST(0, stock - ?)
             WHERE id = ?'
        );
        return $stmt->execute([$quantite, $id]);
    }

    /** Recalculer le stock global du produit parent (somme des variantes) */
    public function syncStockProduit(int $produitId): void
    {
        $stmt = $this->db->prepare(
            'UPDATE products p
             SET p.stock = (
                 SELECT COALESCE(SUM(v.stock), 0)
                 FROM produit_variantes v
                 WHERE v.produit_id = p.id AND v.est_actif = 1
             )
             WHERE p.id = ?'
        );
        $stmt->execute([$produitId]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE produit_variantes SET est_actif = 0 WHERE id = ?'
        );
        return $stmt->execute([$id]);
    }
}
