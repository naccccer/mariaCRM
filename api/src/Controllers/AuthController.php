<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Support\Auth;
use App\Support\HttpException;
use App\Support\Request;
use App\Support\Validator;

final class AuthController
{
    public function __construct(private readonly Request $request)
    {
    }

    public function login(): array
    {
        $body = $this->request->body();
        Validator::required($body, ['email', 'password']);
        Validator::email((string) $body['email']);

        $user = Auth::authenticate((string) $body['email'], (string) $body['password']);
        if (!$user) {
            throw new HttpException('Invalid credentials', 401);
        }

        Auth::login($user);

        return [
            'status' => 200,
            'data' => [
                'user' => Auth::user(),
            ],
        ];
    }

    public function logout(): array
    {
        Auth::requireAuth();
        Auth::logout();

        return [
            'status' => 200,
            'data' => [
                'message' => 'Logged out',
            ],
        ];
    }

    public function me(): array
    {
        $user = Auth::requireAuth();

        return [
            'status' => 200,
            'data' => [
                'user' => $user,
            ],
        ];
    }
}
