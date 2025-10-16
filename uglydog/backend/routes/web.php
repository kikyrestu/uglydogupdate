<?php

use App\Filament\Pages\Login;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GameController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\WalletController;
use App\Http\Controllers\Auth\GameProfileController;
use App\Http\Controllers\Auth\LeaderboardsController;
use App\Http\Controllers\Auth\SocialController;


Route::get('/admin/login', Login::class)->name('filament.admin.auth.login');

Route::middleware('web')->prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::put('/update', [AuthController::class, 'update'])->middleware('auth:pengguna');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:pengguna');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:pengguna');
    Route::get('/users', [AuthController::class, 'users'])->middleware('auth:pengguna');
    Route::post('/wallets', [WalletController::class, 'store'])->middleware('auth:pengguna');
    Route::put('/wallets', [WalletController::class, 'update'])->middleware('auth:pengguna');
    Route::delete('/wallets/{id}', [WalletController::class, 'destroy'])->middleware('auth:pengguna');

    Route::get('/google/redirect', [GoogleController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [GoogleController::class, 'handleGoogleCallback']);

    Route::get('/game', [GameController::class, 'index'])->middleware('auth:pengguna');
    Route::put('/game/profile', [GameProfileController::class, 'updateProfile'])->middleware('auth:pengguna');
    Route::post('/game/saved', [GameController::class, 'GameSaved'])->middleware('auth:pengguna');
    Route::get('/game/logs', [GameController::class, 'getUserLogs'])->middleware('auth:pengguna');
});

Route::prefix('api/leaderboard')->group(function () {
    Route::get('/daily', [LeaderboardsController::class, 'getdailyLeaderboard']);
    Route::get('/dev-daily', [LeaderboardsController::class, 'getDevDailyLeaderboard']); // DEV: leaderboard tanpa cache
    Route::get('/my-position', [LeaderboardsController::class, 'getUserPosition'])->middleware('auth:pengguna');
});

// Route::get('/', function () {
//     return view('welcome');
// });
