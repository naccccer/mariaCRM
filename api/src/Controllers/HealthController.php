<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Support\Auth;

final class HealthController
{
    public function ping(): array
    {
        $user = Auth::user();

        return [
            'status' => 200,
            'data' => [
                'service' => 'MariaCRM API',
                'authenticated' => (bool) $user,
                'timestamp' => gmdate('c'),
            ],
        ];
    }
}
