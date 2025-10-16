<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'total_score' => $this->total_score,
            'best_session' => $this->best_session,
            'total_sessions' => $this->total_sessions,
            'current_savepoint' => $this->current_savepoint,
            'last_play_date' => $this->last_play_date?->format('Y-m-d'),
            'achievements' => $this->achievements ?? [],
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
