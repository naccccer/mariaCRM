<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Services\IntegrationLogger;
use App\Support\Auth;
use App\Support\Request;
use App\Support\Validator;

final class TicketsController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('tickets.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->listTickets([
                    'status' => $this->request->query('status', ''),
                ]),
            ],
        ];
    }

    public function create(): array
    {
        $user = Auth::requirePermission('tickets.write');
        $body = $this->request->body();
        Validator::required($body, ['subject']);

        $id = $this->repository->createTicket($body, (int) $user['id']);

        return [
            'status' => 201,
            'data' => ['id' => $id],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('tickets.write');
        $this->repository->updateTicket($id, $this->request->body());

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }

    public function addComment(int $id): array
    {
        $user = Auth::requirePermission('tickets.write');
        $body = $this->request->body();
        Validator::required($body, ['body']);

        $commentId = $this->repository->addTicketComment($id, (int) $user['id'], (string) $body['body']);

        if (!empty($body['channel'])) {
            IntegrationLogger::log((string) $body['channel'], 'outbound', 'manual', ['ticket_id' => $id, 'comment_id' => $commentId, 'body' => (string) $body['body']]);
        }

        return [
            'status' => 201,
            'data' => ['id' => $commentId],
        ];
    }
}
