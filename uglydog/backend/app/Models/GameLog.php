<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameLog extends Model
{
    use HasFactory;

    protected $table = 'game_logs';
    protected $fillable = [
        'user_id',
        'session_score',
        'savepoint_score',
        'misses',
        'bonus_collected',
        'play_duration',
        'signature',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'bonus_collected' => 'array',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'user_id');
    }
}
