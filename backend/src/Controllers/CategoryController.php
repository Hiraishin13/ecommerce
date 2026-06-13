<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\CategoryModel;

class CategoryController extends Controller
{
    private CategoryModel $categories;

    public function __construct()
    {
        $this->categories = new CategoryModel();
    }

    public function index(Request $request, Response $response): void
    {
        $categories = $this->categories->findAll();
        $response->success(['categories' => $categories]);
    }

    public function show(Request $request, Response $response): void
    {
        $slug     = $request->param('slug');
        $category = $this->categories->findBySlug($slug);

        if (!$category) {
            $response->error('Category not found.', 404);
        }

        $response->success(['category' => $category]);
    }
}
