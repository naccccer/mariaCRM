<?php

declare(strict_types=1);

namespace App\Support;

final class Router
{
    /** @var array<int, array{method: string, pattern: string, handler: callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): array
    {
        $method = strtoupper($method);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $params = $this->match($route['pattern'], $path);
            if ($params === null) {
                continue;
            }

            return ($route['handler'])(...$params);
        }

        throw new HttpException('Route not found', 404);
    }

    private function match(string $pattern, string $path): ?array
    {
        $regex = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '([\\w-]+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (!preg_match($regex, $path, $matches)) {
            return null;
        }

        array_shift($matches);

        return array_map(static function (string $value): int|string {
            if (ctype_digit($value)) {
                return (int) $value;
            }

            return $value;
        }, $matches);
    }
}
