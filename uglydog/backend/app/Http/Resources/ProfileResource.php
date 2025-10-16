<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
     public function toArray($request)
    {
        return [
            'id'    => $this->id,
            'name'  => $this->name,
            'email' => $this->email,

            'wallets' => $this->wallets->map(function ($wallet) {
                return [
                    'id'    => $wallet->id,
                    'provider' => $wallet->provider,
                    'address'  => $wallet->address,
                ];
            })
        ];
    }
}
