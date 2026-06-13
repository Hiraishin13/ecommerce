<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\ProductModel;
use App\Models\ReviewModel;

class ReviewController extends Controller
{
    private ReviewModel  $reviews;
    private ProductModel $products;

    public function __construct()
    {
        $this->reviews  = new ReviewModel();
        $this->products = new ProductModel();
    }

    public function index(Request $request, Response $response): void
    {
        $productId = (int) $request->param('id');
        $page      = max(1, (int) $request->query('page', 1));
        $limit     = min(50, max(1, (int) $request->query('limit', 10)));
        $offset    = ($page - 1) * $limit;

        $reviews = $this->reviews->findByProduct($productId, $limit, $offset);
        $total   = $this->reviews->countByProduct($productId);
        $avg     = $this->reviews->averageRating($productId);

        $response->success([
            'reviews'        => $reviews,
            'total'          => $total,
            'average_rating' => round($avg, 1),
            'pagination'     => [
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    public function store(Request $request, Response $response): void
    {
        $userId    = (int) $request->param('_auth_user_id');
        $productId = (int) $request->param('id');
        $data      = $request->body();

        $errors = $this->validate($data, [
            'rating' => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        $rating = (int) $data['rating'];
        if ($rating < 1 || $rating > 5) {
            $response->error('Rating must be between 1 and 5.', 422);
        }

        $product = $this->products->findById($productId);
        if (!$product) {
            $response->error('Product not found.', 404);
        }

        if ($this->reviews->hasUserReviewed($userId, $productId)) {
            $response->error('You have already reviewed this product.', 409);
        }

        $reviewId = $this->reviews->create([
            'product_id'  => $productId,
            'user_id'     => $userId,
            'rating'      => $rating,
            'title'       => isset($data['title']) ? trim($data['title']) : null,
            'body'        => isset($data['comment']) ? trim($data['comment']) : (isset($data['body']) ? trim($data['body']) : null),
            'is_approved' => 1,
        ]);

        $response->success(['review_id' => $reviewId], 'Review submitted.', 201);
    }

    public function destroy(Request $request, Response $response): void
    {
        $userId   = (int) $request->param('_auth_user_id');
        $reviewId = (int) $request->param('id');

        $deleted = $this->reviews->destroy($reviewId, $userId);

        if (!$deleted) {
            $response->error('Review not found or does not belong to you.', 404);
        }

        $response->success(null, 'Review deleted.');
    }
}
