<?php

declare(strict_types=1);

return [
    'session_name' => getenv('APP_SESSION_NAME') ?: 'maria_crm_session',
    'allowed_origins' => array_filter(array_map('trim', explode(',', getenv('APP_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://127.0.0.1:5173,http://localhost'))),
    'timezone' => getenv('APP_TIMEZONE') ?: 'UTC',
];