<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\Request;
use App\Support\Validator;

final class LeadsController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('leads.read');

        $filters = [
            'search' => $this->request->query('search', ''),
            'status' => $this->request->query('status', ''),
        ];

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->listLeads($filters),
            ],
        ];
    }

    public function create(): array
    {
        $user = Auth::requirePermission('leads.write');
        $body = $this->request->body();

        Validator::required($body, ['full_name', 'phone']);

        $id = $this->repository->createLead($body, (int) $user['id']);

        return [
            'status' => 201,
            'data' => ['id' => $id],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('leads.write');
        $this->repository->updateLead($id, $this->request->body());

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }

    public function convert(int $id): array
    {
        $user = Auth::requirePermission('leads.write');

        return [
            'status' => 200,
            'data' => $this->repository->convertLead($id, (int) $user['id']),
        ];
    }
}
