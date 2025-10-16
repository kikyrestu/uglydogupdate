<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\Visitor;
use App\Models\AddVisitor;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class VisitorController extends Controller
{
    public function track(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $ip = $request->ip();

        $already = Visitor::where('ip_address', $ip)
            ->where('date', $today)
            ->exists();
        if ($already) {
            return response()->json(['message' => 'Already counted'], 200);
        }

        Visitor::create([
            'ip_address' => $ip,
            'date' => Carbon::today()->toDateString(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['message' => 'Visitor tracked'], 201);
    }

    public function total()
    {
        $real = Visitor::count() ?: 0;
        $manual = AddVisitor::sum('added_count') ?: 0;

        return response()->json([
            'total' => $real + $manual,
            'real' => $real,
            'manual' => $manual,
        ]);
    }

    public function addManual(Request $request)
    {
        $request->validate([
            'added_count' => 'required|integer|min:1',
        ]);

        AddVisitor::create([
            'added_count' => $request->added_count,
        ]);

        return response()->json(['message' => 'Manual visitor added']);
    }
}
