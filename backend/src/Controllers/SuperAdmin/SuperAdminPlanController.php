<?php

declare(strict_types=1);

namespace App\Controllers\SuperAdmin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\PlanModel;

class SuperAdminPlanController extends Controller
{
    private PlanModel $plans;

    public function __construct()
    {
        $this->plans = new PlanModel();
    }

    public function index(Request $request, Response $response): void
    {
        $response->success(['plans' => $this->plans->findAll()]);
    }

    public function store(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'name' => 'required|min:2|max:100',
            'slug' => 'required|min:2|max:100',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        $id   = $this->plans->create($data);
        $plan = $this->plans->findById($id);

        $response->success(['plan' => $plan], 'Plan created.', 201);
    }

    public function update(Request $request, Response $response): void
    {
        $id   = (int) $request->param('id');
        $plan = $this->plans->findById($id);

        if (!$plan) {
            $response->error('Plan not found.', 404);
        }

        $this->plans->update($id, $request->body());
        $response->success(['plan' => $this->plans->findById($id)], 'Plan updated.');
    }

    public function destroy(Request $request, Response $response): void
    {
        $id = (int) $request->param('id');

        if (!$this->plans->findById($id)) {
            $response->error('Plan not found.', 404);
        }

        $this->plans->delete($id);
        $response->success(null, 'Plan deleted.');
    }
}
