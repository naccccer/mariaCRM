<?php

declare(strict_types=1);

namespace App\Support;

final class Request
{
    public function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public function integer(string $key, int $default = 0): int
    {
        $value = $this->query($key, $default);
        return is_numeric($value) ? (int) $value : $default;
    }

    public function json(): array
    {
        $raw = file_get_contents('php://input');
        if (!$raw) {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function body(): array
    {
        if (!empty($_POST)) {
            return $_POST;
        }

        return $this->json();
    }

    public function file(string $key): ?array
    {
        return $_FILES[$key] ?? null;
    }
}