<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\Database;

final class IntegrationLogger
{
    public static function log(string $channel, string $direction, string $status, array $payload = [], ?string $response = null): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('INSERT INTO integration_logs (channel, direction, status, payload, response_body, created_at) VALUES (:channel, :direction, :status, :payload, :response_body, UTC_TIMESTAMP())');
        $stmt->execute([
            ':channel' => $channel,
            ':direction' => $direction,
            ':status' => $status,
            ':payload' => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':response_body' => $response,
        ]);
    }
}