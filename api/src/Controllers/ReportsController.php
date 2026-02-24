<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;

final class ReportsController
{
    public function __construct(private readonly CrmRepository $repository)
    {
    }

    public function kpi(): array
    {
        Auth::requirePermission('reports.read');

        return [
            'status' => 200,
            'data' => $this->repository->reportKpi(),
        ];
    }

    public function pipeline(): array
    {
        Auth::requirePermission('reports.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->reportPipeline(),
            ],
        ];
    }

    public function users(): array
    {
        Auth::requirePermission('reports.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->reportUsers(),
            ],
        ];
    }
}
