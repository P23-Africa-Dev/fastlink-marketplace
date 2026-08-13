<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Campaign */
class CampaignResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $spend = (float) $this->spend;
        $conversions = (int) $this->conversions;
        $roi = $spend > 0 ? round(($conversions * 10) / $spend * 100, 1) : 0;

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'channel' => $this->channel,
            'platform' => $this->channel,
            'spend' => $spend,
            'conversions' => $conversions,
            'roi' => $roi,
            'status' => $this->status,
            'displayStatus' => match ($this->status) {
                'successful' => 'Successful',
                'completed' => 'Completed',
                'reviewing' => 'Reviewing',
                'on_hold' => 'On Hold',
                default => 'Active',
            },
            'startsAt' => $this->starts_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
