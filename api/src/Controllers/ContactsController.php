<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\HttpException;
use App\Support\Request;
use App\Support\Validator;

final class ContactsController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('contacts.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->listContacts([
                    'search' => $this->request->query('search', ''),
                ]),
            ],
        ];
    }

    public function show(int $id): array
    {
        Auth::requirePermission('contacts.read');

        $contact = $this->repository->getContact($id);
        if (!$contact) {
            throw new HttpException('Contact not found', 404);
        }

        return [
            'status' => 200,
            'data' => [
                'contact' => $contact,
            ],
        ];
    }

    public function create(): array
    {
        $user = Auth::requirePermission('contacts.write');
        $body = $this->request->body();
        Validator::required($body, ['full_name', 'phone']);

        $id = $this->repository->createContact($body, (int) $user['id']);

        return [
            'status' => 201,
            'data' => ['id' => $id],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('contacts.write');
        $this->repository->updateContact($id, $this->request->body());

        return [
            'status' => 200,
            'data' => ['updated' => true],
        ];
    }

    public function timeline(int $id): array
    {
        Auth::requirePermission('contacts.read');

        return [
            'status' => 200,
            'data' => [
                'items' => $this->repository->getContactTimeline($id),
            ],
        ];
    }
}
