<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\ProductModel;

class ProductController extends Controller
{
    private ProductModel $products;

    public function __construct()
    {
        $this->products = new ProductModel();
    }

    public function index(Request $request, Response $response): void
    {
        $page  = max(1, (int) $request->query('page', 1));
        $limit = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $filters = [];

        if ($categoryId = $request->query('category_id')) {
            $filters['category_id'] = (int) $categoryId;
        }

        if ($minPrice = $request->query('min_price')) {
            $filters['min_price'] = (float) $minPrice;
        }

        if ($maxPrice = $request->query('max_price')) {
            $filters['max_price'] = (float) $maxPrice;
        }

        if ($search = $request->query('search')) {
            $filters['search'] = trim($search);
        }

        if ($request->query('is_featured')) {
            $filters['is_featured'] = 1;
        }

        $products = $this->products->findAll($filters, ['limit' => $limit, 'offset' => $offset]);
        $total    = $this->products->countFiltered($filters);

        // Decode images JSON
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

    public function show(Request $request, Response $response): void
    {
        $slug    = $request->param('slug');
        $product = $this->products->findBySlug($slug);

        if (!$product) {
            $response->error('Product not found.', 404);
        }

        if (is_string($product['images'])) {
            $product['images'] = json_decode($product['images'], true) ?? [];
        }

        $response->success(['product' => $product]);
    }

    public function featured(Request $request, Response $response): void
    {
        $limit    = min(20, max(1, (int) $request->query('limit', 8)));
        $products = $this->products->getFeatured($limit);
        $this->decodeImages($products);
        $response->success(['products' => $products]);
    }

    public function bestsellers(Request $request, Response $response): void
    {
        $limit    = min(20, max(1, (int) $request->query('limit', 8)));
        $products = $this->products->getBestsellers($limit);
        $this->decodeImages($products);
        $response->success(['products' => $products]);
    }

    public function search(Request $request, Response $response): void
    {
        $q     = trim((string) $request->query('q', ''));
        $limit = min(50, max(1, (int) $request->query('limit', 20)));

        if (strlen($q) < 2) {
            $response->success(['products' => [], 'total' => 0]);
        }

        $products = $this->products->search($q, $limit);
        $this->decodeImages($products);
        $response->success(['products' => $products, 'total' => count($products)]);
    }

    private function decodeImages(array &$products): void
    {
        foreach ($products as &$product) {
            if (is_string($product['images'])) {
                $product['images'] = json_decode($product['images'], true) ?? [];
            }
        }
        unset($product);
    }
}
