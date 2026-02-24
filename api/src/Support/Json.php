<?php

declare(strict_types=1);

namespace App\Support;

final class Json
{
    public static function send(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function ok(array $data = [], array $meta = [], int $status = 200): void
    {
        self::send([
            'success' => true,
            'data' => $data,
            'error' => null,
            'meta' => $meta,
        ], $status);
    }

    public static function fail(string $message, int $status = 400, array $details = []): void
    {
        self::send([
            'success' => false,
            'data' => null,
            'error' => [
                'message' => $message,
                'details' => $details,
            ],
            'meta' => [],
        ], $status);
    }
}