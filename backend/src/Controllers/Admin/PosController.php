<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\PosVenteModel;
use App\Models\ProduitVarianteModel;
use App\Models\ProductModel;
use App\Services\PosService;
use RuntimeException;

class PosController extends Controller
{
    private PosVenteModel        $ventes;
    private PosService           $posService;
    private ProduitVarianteModel $variantes;
    private ProductModel         $produits;

    public function __construct()
    {
        $this->ventes     = new PosVenteModel();
        $this->posService = new PosService();
        $this->variantes  = new ProduitVarianteModel();
        $this->produits   = new ProductModel();
    }

    // ── Recherche produit rapide (caisse) ──────────────────────────────────
    public function rechercherProduits(Request $request, Response $response): void
    {
        $q     = (string) $request->query('q', '');
        $limit = min(20, max(1, (int) $request->query('limit', 10)));

        if (strlen(trim($q)) < 1) {
            $response->success(['produits' => []]);
            return;
        }

        $produits = $this->produits->rechercherCaisse($q, $limit);
        $response->success(['produits' => $produits]);
    }

    // ── Variantes d'un produit ─────────────────────────────────────────────
    public function variantesProduit(Request $request, Response $response): void
    {
        $produitId = (int) $request->param('id');
        $variantes = $this->variantes->findByProduit($produitId);
        $response->success(['variantes' => $variantes]);
    }

    // ── Créer une vente ────────────────────────────────────────────────────
    public function creerVente(Request $request, Response $response): void
    {
        $caissier_id = (int) $request->param('_auth_user_id');
        $data        = $request->body();

        try {
            $vente = $this->posService->creerVente($caissier_id, $data);
            $response->success(['vente' => $vente], 'Vente créée avec succès.', 201);
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // ── Lister les ventes ──────────────────────────────────────────────────
    public function listerVentes(Request $request, Response $response): void
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $filtres = array_filter([
            'statut'      => (string) $request->query('statut', ''),
            'canal'       => (string) $request->query('canal', ''),
            'caissier_id' => (string) $request->query('caissier_id', ''),
            'date_debut'  => (string) $request->query('date_debut', ''),
            'date_fin'    => (string) $request->query('date_fin', ''),
            'q'           => (string) $request->query('q', ''),
        ]);

        $ventes = $this->ventes->findAll($filtres, $limit, $offset);
        $total  = $this->ventes->countAll($filtres);

        $response->success([
            'ventes'     => $ventes,
            'total'      => $total,
            'pagination' => [
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
            'stats_jour' => $this->ventes->statsJour(),
        ]);
    }

    // ── Détail d'une vente ─────────────────────────────────────────────────
    public function afficherVente(Request $request, Response $response): void
    {
        $id    = (int) $request->param('id');
        $vente = $this->ventes->findById($id);

        if (!$vente) {
            $response->error('Vente introuvable.', 404);
        }

        $response->success(['vente' => $vente]);
    }

    // ── Ajouter un paiement (solde acompte) ───────────────────────────────
    public function ajouterPaiement(Request $request, Response $response): void
    {
        $venteId  = (int) $request->param('id');
        $paiement = $request->body();

        try {
            $vente = $this->posService->ajouterPaiement($venteId, $paiement);
            $response->success(['vente' => $vente], 'Paiement enregistré.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // ── Annuler une vente ─────────────────────────────────────────────────
    public function annulerVente(Request $request, Response $response): void
    {
        $id    = (int) $request->param('id');
        $vente = $this->ventes->findById($id);

        if (!$vente) {
            $response->error('Vente introuvable.', 404);
        }
        if (in_array($vente['statut'], ['annulee', 'remboursee'], true)) {
            $response->error('Vente déjà annulée.', 400);
        }

        $this->ventes->updateStatut($id, 'annulee');
        $response->success(['vente' => $this->ventes->findById($id)], 'Vente annulée.');
    }

    // ── Générer lien WhatsApp ticket ───────────────────────────────────────
    public function genererLienWhatsApp(Request $request, Response $response): void
    {
        $id    = (int) $request->param('id');
        $vente = $this->ventes->findById($id);

        if (!$vente) {
            $response->error('Vente introuvable.', 404);
        }

        $telephone = $request->body()['telephone'] ?? $vente['client_telephone'] ?? null;

        if (!$telephone) {
            $response->error('Numéro de téléphone requis.', 422);
        }

        // Nettoyer le numéro (supprimer +, espaces, tirets)
        $numero  = preg_replace('/[^0-9]/', '', $telephone);
        $message = $this->construireMessageTicket($vente);
        $lien    = 'https://wa.me/' . $numero . '?text=' . rawurlencode($message);

        $response->success([
            'lien_whatsapp' => $lien,
            'telephone'     => $telephone,
        ]);
    }

    // ── Variantes d'un produit (admin CRUD) ───────────────────────────────
    public function creerVariante(Request $request, Response $response): void
    {
        $produitId = (int) $request->param('id');
        $data      = $request->body();

        $errors = $this->validate($data, ['stock' => 'required']);
        if (!empty($errors)) {
            $response->error('Données invalides.', 422, $errors);
        }

        $varianteId = $this->variantes->create(array_merge($data, ['produit_id' => $produitId]));
        $variante   = $this->variantes->findById($varianteId);

        $response->success(['variante' => $variante], 'Variante créée.', 201);
    }

    public function mettreAJourVariante(Request $request, Response $response): void
    {
        $id   = (int) $request->param('vid');
        $data = $request->body();

        $variante = $this->variantes->findById($id);
        if (!$variante) {
            $response->error('Variante introuvable.', 404);
        }

        $this->variantes->update($id, $data);
        $this->variantes->syncStockProduit((int) $variante['produit_id']);

        $response->success(['variante' => $this->variantes->findById($id)], 'Variante mise à jour.');
    }

    public function supprimerVariante(Request $request, Response $response): void
    {
        $id       = (int) $request->param('vid');
        $variante = $this->variantes->findById($id);

        if (!$variante) {
            $response->error('Variante introuvable.', 404);
        }

        $this->variantes->delete($id);
        $this->variantes->syncStockProduit((int) $variante['produit_id']);

        $response->success(null, 'Variante supprimée.');
    }

    // ── Helpers privés ─────────────────────────────────────────────────────

    private function construireMessageTicket(array $vente): string
    {
        $enseigne   = 'SHOP';
        $date       = date('d/m/Y H:i', strtotime($vente['created_at']));
        $lignes     = [];

        foreach ($vente['articles'] ?? [] as $art) {
            $variante = trim(($art['taille'] ?? '') . ' ' . ($art['couleur'] ?? ''));
            $ligne    = "{$art['nom_produit']}";
            if ($variante) {
                $ligne .= " ({$variante})";
            }
            $ligne   .= " × {$art['quantite']}";
            $lignes[] = $ligne;
            $lignes[] = '    ' . number_format((float) $art['sous_total'], 0, ',', ' ') . ' FC';
        }

        $modesPaiement = '';
        foreach ($vente['paiements'] ?? [] as $p) {
            $mode = match ($p['mode']) {
                'cash'         => 'Cash',
                'mobile_money' => 'Mobile Money (' . strtoupper($p['operateur'] ?? '') . ')',
                'carte'        => 'Carte',
                default        => ucfirst($p['mode']),
            };
            $modesPaiement .= "\n{$mode} : " . number_format((float) $p['montant'], 0, ',', ' ') . ' FC';
        }

        $total   = number_format((float) $vente['total'], 0, ',', ' ');
        $solde   = number_format((float) $vente['solde_restant'], 0, ',', ' ');
        $message = "🧾 *TICKET — {$enseigne}*\n";
        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "N° {$vente['numero_vente']}\n";
        $message .= "📅 {$date}\n";
        $message .= ($vente['client_nom'] ? "👤 {$vente['client_nom']}\n" : '');
        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "*ARTICLES*\n";
        $message .= implode("\n", $lignes) . "\n";
        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "*TOTAL : {$total} FC*\n";

        if ((float) $vente['remise_montant'] > 0) {
            $remise   = number_format((float) $vente['remise_montant'], 0, ',', ' ');
            $message .= "🎁 Remise : -{$remise} FC\n";
        }

        $message .= "\n*PAIEMENT*{$modesPaiement}\n";

        if ((float) $vente['solde_restant'] > 0) {
            $message .= "⚠️ Solde restant : {$solde} FC\n";
        }

        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "Merci pour votre confiance ! 🙏";

        return $message;
    }
}
