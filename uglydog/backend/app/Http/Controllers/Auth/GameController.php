<?php

namespace App\Http\Controllers\Auth;

use App\Models\GameLog;
use Illuminate\Http\Request;
use App\Models\UserGameProfile;
use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
     public function index()
    {
        $user = Auth::guard('pengguna')->user();
        $profile = UserGameProfile::firstOrCreate(['user_id' => $user->id]);

        return new GameResource($profile);
    }
    public function GameSaved(Request $request)
    {
        $user = Auth::guard('pengguna')->user();

        $request->validate([
            'session_score' => 'required|integer',
            'savepoint_score' => 'sometimes|integer',
            'misses' => 'sometimes|integer',
            'bonus_collected' => 'sometimes|array',
            'play_duration' => 'sometimes|integer',
            'signature' => 'sometimes|string',

            // Add fields to update game profile
            'total_score' => 'sometimes|integer',
            'best_session' => 'sometimes|integer',
            'total_sessions' => 'sometimes|integer',
            'current_savepoint' => 'sometimes|integer',
            'achievements' => 'sometimes|array',
        ]);

        // 1. Create game log
        $log = GameLog::create([
            'user_id' => $user->id,
            'session_score' => $request->session_score,
            'savepoint_score' => $request->savepoint_score ?? 0,
            'misses' => $request->misses ?? 0,
            'bonus_collected' => $request->bonus_collected,
            'play_duration' => $request->play_duration,
            'signature' => $request->signature,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 2. Update user game profile
        $profile = UserGameProfile::firstOrNew(['user_id' => $user->id]);

        // Update fields from request if available
        $profile->fill($request->only([
            'total_score',
            'best_session',
            'total_sessions',
            'current_savepoint',
            'achievements'
        ]));

        // Update automatically calculated fields
        $profile->total_score = ($profile->total_score ?? 0) + $request->session_score;
        $profile->total_sessions = ($profile->total_sessions ?? 0) + 1;
        $profile->best_session = max($profile->best_session ?? 0, $request->session_score);
        $profile->last_play_date = now()->toDateString();

        $profile->save();

        return response()->json([
            'message' => 'Game session recorded and profile updated successfully',
            'log' => $log,
            'profile' => $profile
        ], 201);
    }

    public function getUserLogs()
    {
        $user = Auth::guard('pengguna')->user();
        $logs = GameLog::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();

        return response()->json($logs);
    }
}

