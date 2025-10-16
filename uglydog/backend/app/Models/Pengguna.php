<?php

namespace App\Models;

use App\Models\Wallet;
use App\Models\TaskUser;
use App\Models\UserGameProfile;
use App\Models\GameLog;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;

class Pengguna extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'penggunas';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Penting: Nonaktifkan auto-increment & set UUID sebagai string
     */
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Auto-generate UUID saat model dibuat
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function wallets()
{
    return $this->hasMany(Wallet::class, 'pengguna_id'); // atau 'pengguna_id', sesuai DB-mu

}
public function socialAccounts()
{
    return $this->hasMany(SocialitePengguna::class, 'user_id');
}


    public function gameProfile()
    {
        return $this->hasOne(UserGameProfile::class, 'user_id');
    }

    public function gameLogs()
    {
        return $this->hasMany(GameLog::class, 'user_id');
    }
}
