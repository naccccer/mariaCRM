<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\Request;
use App\Support\Validator;

final class DealsController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('deals.read');

        return [
            'status' => 200,
            'data' => [
                'stages' => $this->repository->listPipelineStages(),
                'items' => $this->repository->listDeals([
                    'pipeline_id' => $this->request->query('pipeline_id', ''),
                    'status' => $this->request->query('status', ''),
                    'contact_id' => $this->request->query('contact_id', ''),
                ]),
            ],
        ];
    }

    public function create(): array
    {
        $user = Auth::requirePermission('deals.write');
        $body = $this->request->body();
        Validator::required($body, ['title', 'contact_id']);

        $id = $this->repository->createDeal($body, (int) $user['id']);

        return [
            'status' => 201,
            'data' => ['id' => $id],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('deals.write');
        $this->repository->updateDeal($id, $this->request->body());

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }

    public function moveStage(int $id): array
    {
        $user = Auth::requirePermission('deals.write');
        $body = $this->request->body();
        Validator::required($body, ['stage_id']);

        $this->repository->moveDealStage($id, (int) $body['stage_id'], (int) $user['id']);

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }
}
