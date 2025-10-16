<?php

namespace App\Http\Controllers\Auth;

use App\Models\Pengguna;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\UserGameProfile;
use App\Models\SocialitePengguna;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle()
{
    return Socialite::driver('google')->stateless()->redirect();
}

// Handle callback dari Google
public function handleGoogleCallback(Request $request)
{
    $googleUser = Socialite::driver('google')->stateless()->user();

    $account = SocialitePengguna::where('provider', 'google')
        ->where('provider_id', $googleUser->getId())
        ->first();

    if ($account) {
        $user = $account->user;
    } else {
        $user = Pengguna::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = Pengguna::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(Str::random(24)),
            ]);

            UserGameProfile::create([
                'user_id' => $user->id,
                'total_score' => 0,
                'best_session' => 0,
                'total_sessions' => 0,
                'current_savepoint' => 0,
            ]);
        }

        SocialitePengguna::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => $googleUser->getId(),
        ]);
    }

    Auth::guard('pengguna')->login($user);
    $request->session()->regenerate(); // wajib

    return redirect()->to('http://localhost:3000/dashboard');
}
}
