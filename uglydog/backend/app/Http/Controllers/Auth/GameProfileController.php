<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\UserGameProfile;

class GameProfileController extends Controller
{
    public function getProfile()
    {
        $user = Auth::guard('pengguna')->user();
        $profile = UserGameProfile::firstOrCreate(['user_id' => $user->id]);

        return response()->json($profile);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::guard('pengguna')->user();
        $profile = UserGameProfile::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'total_score' => 'sometimes|integer',
            'best_session' => 'sometimes|integer',
            'total_sessions' => 'sometimes|integer',
            'current_savepoint' => 'sometimes|integer',
            'last_play_date' => 'sometimes|date',
            'achievements' => 'sometimes|array',
        ]);

        $profile->update($request->all());

        return response()->json([
            'message' => 'Profil game berhasil diperbarui',
            'profile' => $profile
        ]);
    }
}
