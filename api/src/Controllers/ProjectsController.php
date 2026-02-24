<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\Request;
use App\Support\Validator;

final class ProjectsController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('projects.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->listProjects([
                    'search' => $this->request->query('search', ''),
                ]),
            ],
        ];
    }

    public function create(): array
    {
        Auth::requirePermission('projects.write');
        $body = $this->request->body();
        Validator::required($body, ['name']);

        $id = $this->repository->createProject($body);

        return [
            'status' => 201,
            'data' => ['id' => $id],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('projects.write');
        $this->repository->updateProject($id, $this->request->body());

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }
}
