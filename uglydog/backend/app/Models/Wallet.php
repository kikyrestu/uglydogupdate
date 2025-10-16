<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'pengguna_id',
        'provider',
        'address',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class);
    }
}

