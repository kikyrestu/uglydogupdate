<?php

return [
    'paths' => ['api/*', 'auth/*', 'sanctum/csrf-cookie', 'leaderboard/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Hanya ini, yang 'allowed_credentials' hapus
];
