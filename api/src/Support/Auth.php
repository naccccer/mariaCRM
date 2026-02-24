<?php

declare(strict_types=1);

namespace App\Support;

use PDO;

final class Auth
{
    private static ?array $cachedUser = null;

    public static function bootSession(): void
    {
        $appConfig = require dirname(__DIR__, 3) . '/config/app.php';

        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_name($appConfig['session_name']);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        session_start();
    }

    public static function login(array $user): void
    {
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['logged_in_at'] = gmdate('Y-m-d H:i:s');

        $pdo = Database::connection();
        $stmt = $pdo->prepare('INSERT INTO sessions (session_id, user_id, ip_address, user_agent, created_at) VALUES (:session_id, :user_id, :ip_address, :user_agent, UTC_TIMESTAMP())');
        $stmt->execute([
            ':session_id' => session_id(),
            ':user_id' => (int) $user['id'],
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            ':user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
        ]);

        self::$cachedUser = null;
    }

    public static function logout(): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('UPDATE sessions SET ended_at = UTC_TIMESTAMP() WHERE session_id = :session_id');
        $stmt->execute([':session_id' => session_id()]);

        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
        }
        session_destroy();

        self::$cachedUser = null;
    }

    public static function user(): ?array
    {
        if (self::$cachedUser !== null) {
            return self::$cachedUser;
        }

        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            return null;
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare('SELECT id, full_name, email, is_active FROM users WHERE id = :id AND deleted_at IS NULL LIMIT 1');
        $stmt->execute([':id' => (int) $userId]);
        $user = $stmt->fetch();

        if (!$user || (int) $user['is_active'] !== 1) {
            return null;
        }

        $roleStmt = $pdo->prepare('SELECT r.id, r.name, r.code FROM roles r INNER JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = :user_id');
        $roleStmt->execute([':user_id' => (int) $userId]);
        $roles = $roleStmt->fetchAll();

        $permStmt = $pdo->prepare('SELECT DISTINCT p.code FROM permissions p INNER JOIN role_permissions rp ON rp.permission_id = p.id INNER JOIN user_roles ur ON ur.role_id = rp.role_id WHERE ur.user_id = :user_id');
        $permStmt->execute([':user_id' => (int) $userId]);
        $permissions = array_map(static fn(array $row): string => $row['code'], $permStmt->fetchAll());

        self::$cachedUser = [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'roles' => $roles,
            'permissions' => $permissions,
        ];

        return self::$cachedUser;
    }

    public static function requireAuth(): array
    {
        $user = self::user();
        if (!$user) {
            throw new HttpException('Unauthenticated', 401);
        }

        return $user;
    }

    public static function requirePermission(string $permission): array
    {
        $user = self::requireAuth();
        if (!in_array($permission, $user['permissions'], true)) {
            throw new HttpException('Forbidden', 403);
        }

        return $user;
    }

    public static function authenticate(string $email, string $password): ?array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('SELECT id, full_name, email, password_hash, is_active FROM users WHERE email = :email AND deleted_at IS NULL LIMIT 1');
        $stmt->execute([':email' => mb_strtolower(trim($email))]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || (int) $user['is_active'] !== 1) {
            return null;
        }

        if (!password_verify($password, $user['password_hash'])) {
            return null;
        }

        unset($user['password_hash']);
        return $user;
    }
}