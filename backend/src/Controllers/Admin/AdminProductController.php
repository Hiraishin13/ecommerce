<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Config\Database;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\ProductModel;
use PDO;

class AdminProductController extends Controller
{
    private ProductModel $products;

    public function __construct()
    {
        $this->products = new ProductModel();
    }

    public function index(Request $request, Response $response): void
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $filters = [];

        if ($search = $request->query('search')) {
            $filters['search'] = trim($search);
        }

        if ($categoryId = $request->query('category_id')) {
            $filters['category_id'] = (int) $categoryId;
        }

        // Admin sees all products including inactive — fetch without is_active filter
        $db   = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            'SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?'
        );
        $stmt->execute([$limit, $offset]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $countStmt = $db->prepare('SELECT COUNT(*) FROM products');
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();

        foreach ($products as &$product) {
            if (is_string($product['images'])) {
                $product['images'] = json_decode($product['images'], true) ?? [];
            }
        }
        unset($product);

        $response->success([
            'products'   => $products,
            'total'      => $total,
            'pagination' => [
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    public function store(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'name'  => 'required|min:2|max:200',
            'price' => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || (float) $data['price'] < 0) {
            $response->error('Price must be a valid non-negative number.', 422);
        }

        $slug = $data['slug'] ?? $this->products->generateSlug($data['name']);

        $productId = $this->products->create([
            'category_id'   => isset($data['category_id']) ? (int) $data['category_id'] : null,
            'name'          => trim($data['name']),
            'slug'          => $slug,
            'description'   => $data['description'] ?? null,
            'price'         => (float) $data['price'],
            'compare_price' => isset($data['compare_price']) ? (float) $data['compare_price'] : null,
            'stock'         => isset($data['stock']) ? (int) $data['stock'] : 0,
            'sku'           => $data['sku'] ?? null,
            'images'        => $data['images'] ?? null,
            'is_active'     => isset($data['is_active']) ? (int) $data['is_active'] : 1,
            'is_featured'   => isset($data['is_featured']) ? (int) $data['is_featured'] : 0,
            'weight'        => isset($data['weight']) ? (float) $data['weight'] : null,
            'meta_title'    => $data['meta_title'] ?? null,
            'meta_desc'     => $data['meta_desc'] ?? null,
        ]);

        $product = $this->products->findById($productId);
        if (is_string($product['images'])) {
            $product['images'] = json_decode($product['images'], true) ?? [];
        }

        $response->success(['product' => $product], 'Product created.', 201);
    }

    public function update(Request $request, Response $response): void
    {
        $productId = (int) $request->param('id');
        $data      = $request->body();

        $product = $this->products->findById($productId);
        if (!$product) {
            $response->error('Product not found.', 404);
        }

        $updateData = [];
        $allowed    = [
            'category_id', 'name', 'slug', 'description', 'price', 'compare_price',
            'stock', 'sku', 'images', 'is_active', 'is_featured', 'weight',
            'meta_title', 'meta_desc',
        ];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (isset($updateData['name']) && !isset($data['slug'])) {
            $updateData['slug'] = $this->products->generateSlug($updateData['name']);
        }

        if (!empty($updateData)) {
            $this->products->update($productId, $updateData);
        }

        $updated = $this->products->findById($productId);
        if (is_string($updated['images'])) {
            $updated['images'] = json_decode($updated['images'], true) ?? [];
        }

        $response->success(['product' => $updated], 'Product updated.');
    }

    public function destroy(Request $request, Response $response): void
    {
        $productId = (int) $request->param('id');
        $product   = $this->products->findById($productId);

        if (!$product) {
            $response->error('Product not found.', 404);
        }

        $this->products->delete($productId);
        $response->success(null, 'Product deleted.');
    }
}
