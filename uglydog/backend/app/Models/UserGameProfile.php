<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGameProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_score',
        'best_session',
        'total_sessions',
        'current_savepoint',
        'last_play_date',
        'achievements',
    ];

    protected $casts = [
        'achievements' => 'array',
        'last_play_date' => 'date',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'user_id');
    }
}
