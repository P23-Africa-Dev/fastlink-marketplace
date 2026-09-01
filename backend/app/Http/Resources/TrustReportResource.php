<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TrustReport */
class TrustReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $subject = $this->relationLoaded('subject') ? $this->subject : null;

        return [
            'id' => (string) $this->id,
            'reason' => $this->reason,
            'details' => $this->details,
            'status' => $this->status,
            'adminNote' => $this->admin_note,
            'subjectType' => $this->subject_type,
            'subjectId' => (string) $this->subject_id,
            'subjectLabel' => match ($this->subject_type) {
                'product' => $subject?->name ?? 'Product #'.$this->subject_id,
                'store' => $subject?->name ?? 'Store #'.$this->subject_id,
                default => $this->subject_type.' #'.$this->subject_id,
            },
            'reporter' => $this->whenLoaded('reporter', fn () => [
                'id' => (string) $this->reporter->id,
                'name' => $this->reporter->name,
                'email' => $this->reporter->email,
            ]),
            'resolvedAt' => $this->resolved_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
