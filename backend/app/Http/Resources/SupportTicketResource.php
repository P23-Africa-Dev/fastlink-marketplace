<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\SupportTicket */
class SupportTicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $messages = $this->whenLoaded('messages', $this->messages, collect());

        return [
            'id' => (string) $this->id,
            'subject' => $this->subject,
            'category' => $this->category,
            'priority' => $this->priority,
            'displayPriority' => ucfirst($this->priority),
            'status' => $this->status,
            'displayStatus' => match ($this->status) {
                'resolved' => 'Resolved',
                'in_progress' => 'In Progress',
                default => 'Open',
            },
            'store' => $this->whenLoaded('store', fn () => $this->store ? [
                'id' => (string) $this->store->id,
                'name' => $this->store->name,
            ] : null),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => (string) $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'messages' => $messages->map(fn ($message) => [
                'id' => (string) $message->id,
                'body' => $message->body,
                'senderId' => (string) $message->sender_id,
                'senderName' => $message->relationLoaded('sender') ? $message->sender?->name : null,
                'fromStaff' => $message->relationLoaded('sender') ? $message->sender?->role === 'admin' : false,
                'createdAt' => $message->created_at?->toIso8601String(),
            ])->values()->all(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
