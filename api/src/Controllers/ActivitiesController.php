<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\Request;
use App\Support\Validator;

final class ActivitiesController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('activities.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->listActivities([
                    'status' => $this->request->query('status', ''),
                    'contact_id' => $this->request->query('contact_id', ''),
                ]),
            ],
        ];
    }

    public function create(): array
    {
        $user = Auth::requirePermission('activities.write');
        $body = $this->request->body();
        Validator::required($body, ['title']);

        $id = $this->repository->createActivity($body, (int) $user['id']);

        return [
            'status' => 201,
            'data' => ['id' => $id],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('activities.write');
        $this->repository->updateActivity($id, $this->request->body());

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }

    public function complete(int $id): array
    {
        Auth::requirePermission('activities.write');
        $this->repository->completeActivity($id);

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }
}
