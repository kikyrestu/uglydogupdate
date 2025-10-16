<?php

// use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VisitorController;

Route::post('/visitor/track', [VisitorController::class, 'track'])->middleware('throttle:5,120');;
Route::get('/visitor/total', [VisitorController::class, 'total']);
Route::post('/visitor/add', [VisitorController::class, 'addManual']);


// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
// Route::get('/posts', [PostController::class, 'index']);

// Route::get('/users', [AuthController::class, 'users']);


// Route::get('/profile', [AuthController::class, 'profile']);


// Route::post('/login', [AuthController::class, 'login']);
