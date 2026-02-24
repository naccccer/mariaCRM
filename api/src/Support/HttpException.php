<?php

declare(strict_types=1);

namespace App\Support;

use RuntimeException;

final class HttpException extends RuntimeException
{
    public function __construct(string $message, private readonly int $statusCode = 400, private readonly array $details = [])
    {
        parent::__construct($message, $statusCode);
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }

    public function details(): array
    {
        return $this->details;
    }
}