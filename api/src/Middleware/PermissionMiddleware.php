<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Support\Auth;

final class PermissionMiddleware
{
    public static function handle(string $permission): array
    {
        return Auth::requirePermission($permission);
    }
}