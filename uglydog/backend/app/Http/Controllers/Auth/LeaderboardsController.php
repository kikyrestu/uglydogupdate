<?php

namespace App\Http\Controllers\Auth;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\UserGameProfile;
use App\Models\WeeklyLeaderboard;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\LeaderboardResource;

class LeaderboardsController extends Controller
{
    public function getDailyLeaderboard()
    {
        $leaderboard = Cache::remember('daily_leaderboard', now()->addDay(), function () {
            return UserGameProfile::with('pengguna')
                ->orderByDesc('total_score')
                ->take(100)
                ->get();
        });

        // Tambahkan peringkat manual
        $leaderboard->each(function ($item, $index) {
            $item->rank = $index + 1;
        });

        return LeaderboardResource::collection($leaderboard);
    }

    // Endpoint leaderboard tanpa cache untuk development/testing
    public function getDevDailyLeaderboard()
    {
        $leaderboard = UserGameProfile::with('pengguna')
            ->orderByDesc('total_score')
            ->take(100)
            ->get();

        // Tambahkan peringkat manual
        $leaderboard->each(function ($item, $index) {
            $item->rank = $index + 1;
        });

        return LeaderboardResource::collection($leaderboard);
    }

}
