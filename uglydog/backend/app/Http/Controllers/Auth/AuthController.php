<?php

namespace App\Http\Controllers\Auth;

use App\Models\Task;
use App\Models\Season;
use App\Models\Wallet;
use App\Models\Pengguna;
use App\Models\ScoreUser;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\UserGameProfile;
use App\Models\SocialitePengguna;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\ProfileResource;
use Laravel\Socialite\Facades\Socialite;


class AuthController extends Controller
{
    public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (!Auth::guard('pengguna')->attempt($credentials)) {
        return response()->json(['message' => 'Login failed'], 401);
    }

    $request->session()->regenerate();

    return response()->json(['message' => 'Login successful']);
}
public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:penggunas,email',
        'password' => 'required|min:6',
    ]);

    // 🧍‍♂️ Buat user
    $user = Pengguna::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);
    UserGameProfile::create([
        'user_id' => $user->id,
        'total_score' => 0,
        'best_session' => 0,
        'total_sessions' => 0,
        'current_savepoint' => 0,
    ]);

    // 🚀 Login langsung pakai guard pengguna
    Auth::guard('pengguna')->login($user);

    // Regenerasi session
    $request->session()->regenerate();

    return response()->json([
        'message' => 'Registration successful!',
        'user' => $user
    ]);
}
// Redirect ke Google
// public function redirectToGoogle()
// {
//     return Socialite::driver('google')->stateless()->redirect();
// }

// // Handle callback dari Google
// public function handleGoogleCallback(Request $request)
// {
//     $googleUser = Socialite::driver('google')->stateless()->user();

//     $account = SocialitePengguna::where('provider', 'google')
//         ->where('provider_id', $googleUser->getId())
//         ->first();

//     if ($account) {
//         $user = $account->user;
//     } else {
//         $user = Pengguna::where('email', $googleUser->getEmail())->first();

//         if (!$user) {
//             $user = Pengguna::create([
//                 'name' => $googleUser->getName(),
//                 'email' => $googleUser->getEmail(),
//                 'password' => Hash::make(Str::random(24)),
//             ]);

//             UserGameProfile::create([
//                 'user_id' => $user->id,
//                 'total_score' => 0,
//                 'best_session' => 0,
//                 'total_sessions' => 0,
//                 'current_savepoint' => 0,
//             ]);
//         }

//         SocialitePengguna::create([
//             'user_id' => $user->id,
//             'provider' => 'google',
//             'provider_id' => $googleUser->getId(),
//         ]);
//     }

//     Auth::guard('pengguna')->login($user);
//     $request->session()->regenerate(); // wajib

//     return redirect()->to('http://localhost:3000/dashboard');
// }


public function update(Request $request)
{
    $user = auth('pengguna')->user();

    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:penggunas,email,' . $user->id,
        'password' => 'nullable|string|min:6|confirmed', // Optional
    ]);

    $user->name = $request->name;
    $user->email = $request->email;

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => $user,
    ]);
}


    public function logout(Request $request)
{
    Auth::guard('pengguna')->logout(); // <-- Penting!

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json(['message' => 'Logout successful']);
}

public function users(Request $request)
{
    $user = $request->user()->load([
        'wallets'
    ]);

    return $resource = new ProfileResource($user);
}
public function me(Request $request)
{
    return response()->json($request->user('pengguna'));
}
}
