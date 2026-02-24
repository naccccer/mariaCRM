<?php

declare(strict_types=1);

namespace App\Support;

final class Validator
{
    public static function required(array $data, array $keys): void
    {
        $missing = [];
        foreach ($keys as $key) {
            $value = $data[$key] ?? null;
            if ($value === null || (is_string($value) && trim($value) === '')) {
                $missing[] = $key;
            }
        }

        if ($missing !== []) {
            throw new HttpException('Validation failed', 422, ['missing' => $missing]);
        }
    }

    public static function email(string $email): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException('Validation failed', 422, ['email' => 'Invalid email']);
        }
    }

    public static function maxLength(string $value, int $max, string $field): void
    {
        if (mb_strlen($value) > $max) {
            throw new HttpException('Validation failed', 422, [$field => "Max length is {$max}"]);
        }
    }
}