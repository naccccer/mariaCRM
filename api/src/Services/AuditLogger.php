<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\Database;

final class AuditLogger
{
    public static function log(?int $userId, string $entityType, ?int $entityId, string $action, array $meta = []): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('INSERT INTO audit_logs (user_id, entity_type, entity_id, action, meta, created_at) VALUES (:user_id, :entity_type, :entity_id, :action, :meta, UTC_TIMESTAMP())');
        $stmt->execute([
            ':user_id' => $userId,
            ':entity_type' => $entityType,
            ':entity_id' => $entityId,
            ':action' => $action,
            ':meta' => json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }
}