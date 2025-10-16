<?php

return [

    'navigation' => [
        'token' => [
            'cluster' => null,
            'group' => 'User',
            'sort' => -1,
            'icon' => 'heroicon-o-key',
        ],
    ],

    'models' => [
        'token' => [
            'enable_policy' => true,
        ],
    ],

    'route' => [
        // FALSE → biar gak pakai /admin/prefix
        'panel_prefix' => false,

        // FALSE → biar kita kontrol middleware-nya sendiri
        'use_resource_middlewares' => false,
    ],

    'middleware' => [
        'auth:sanctum', // << tambahkan ini agar semua API dari filament-api-service tetap pakai sanctum auth
    ],

    'tenancy' => [
        'enabled' => false,
        'awareness' => false,
    ],

];
