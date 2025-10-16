<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'rank' => $this->when(isset($this->rank), $this->rank),
            'user_id' => $this->user_id,
            'name' => $this->pengguna->name ?? null,
            'total_score' => $this->total_score,
            'best_session' => $this->best_session, // expose highest score
            'achievements' => $this->achievements ?? [],
        ];
    }
}
