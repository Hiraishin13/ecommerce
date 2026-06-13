<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\CategoryModel;

class AdminCategoryController extends Controller
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

    public function store(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'name' => 'required|min:2|max:100',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        $slug = $data['slug'] ?? $this->categories->generateSlug($data['name']);

        $categoryId = $this->categories->create([
            'parent_id'   => isset($data['parent_id']) ? (int) $data['parent_id'] : null,
            'name'        => trim($data['name']),
            'slug'        => $slug,
            'description' => $data['description'] ?? null,
            'image'       => $data['image'] ?? null,
            'sort_order'  => isset($data['sort_order']) ? (int) $data['sort_order'] : 0,
        ]);

        $category = $this->categories->findById($categoryId);
        $response->success(['category' => $category], 'Category created.', 201);
    }

    public function update(Request $request, Response $response): void
    {
        $categoryId = (int) $request->param('id');
        $data       = $request->body();

        $category = $this->categories->findById($categoryId);
        if (!$category) {
            $response->error('Category not found.', 404);
        }

        $updateData = [];
        $allowed    = ['parent_id', 'name', 'slug', 'description', 'image', 'sort_order'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (isset($updateData['name']) && !isset($data['slug'])) {
            $updateData['slug'] = $this->categories->generateSlug($updateData['name']);
        }

        if (!empty($updateData)) {
            $this->categories->update($categoryId, $updateData);
        }

        $updated = $this->categories->findById($categoryId);
        $response->success(['category' => $updated], 'Category updated.');
    }

    public function destroy(Request $request, Response $response): void
    {
        $categoryId = (int) $request->param('id');
        $category   = $this->categories->findById($categoryId);

        if (!$category) {
            $response->error('Category not found.', 404);
        }

        $this->categories->delete($categoryId);
        $response->success(null, 'Category deleted.');
    }
}
