<?php

namespace App\Http\Controllers\Auth;

use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class WalletController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'provider' => 'required|string',
            'address' => 'required|string',
        ]);

        $wallet = Wallet::create([
            'pengguna_id' => auth('pengguna')->id(), // or auth()->id()
            'provider' => $request->provider,
            'address' => $request->address,
        ]);

        return response()->json(['message' => 'Wallet created successfully', 'wallet' => $wallet]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'wallet_id' => 'required|integer',
            'provider' => 'required|string',
            'address' => 'required|string',
        ]);

        $wallet = Wallet::where('id', $request->wallet_id)
            ->where('pengguna_id', auth('pengguna')->id())
            ->first();

        if (!$wallet) {
            return response()->json(['message' => 'Wallet not found'], 404);
        }

        $wallet->update([
            'provider' => $request->provider,
            'address' => $request->address,
        ]);

        return response()->json(['message' => 'Wallet updated successfully', 'wallet' => $wallet]);
    }

    public function destroy($id)
    {
        $wallet = Wallet::where('id', $id)->where('pengguna_id', auth('pengguna')->id())->first();

        if (!$wallet) {
            return response()->json(['message' => 'Wallet not found'], 404);
        }

        $wallet->delete();

        return response()->json(['message' => 'Wallet deleted successfully']);
    }
}

