<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\CrmRepository;
use App\Support\Auth;
use App\Support\Request;
use App\Support\Validator;

final class UsersController
{
    public function __construct(private readonly Request $request, private readonly CrmRepository $repository)
    {
    }

    public function index(): array
    {
        Auth::requirePermission('users.manage');

        return [
            'status' => 200,
            'data' => [
                'users' => $this->repository->listUsers(),
                'roles' => $this->repository->listRoles(),
            ],
        ];
    }

    public function create(): array
    {
        $user = Auth::requirePermission('users.manage');
        $body = $this->request->body();

        Validator::required($body, ['full_name', 'email', 'password']);
        Validator::email((string) $body['email']);

        $userId = $this->repository->createUser($body, (int) $user['id']);

        return [
            'status' => 201,
            'data' => [
                'id' => $userId,
            ],
        ];
    }

    public function update(int $id): array
    {
        Auth::requirePermission('users.manage');
        $body = $this->request->body();

        if (isset($body['email'])) {
            Validator::email((string) $body['email']);
        }

        $this->repository->updateUser($id, $body);

        return [
            'status' => 200,
            'data' => [
                'updated' => true,
            ],
        ];
    }
}
