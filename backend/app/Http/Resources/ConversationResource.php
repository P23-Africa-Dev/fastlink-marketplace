<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Conversation */
class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $latest = $this->relationLoaded('latestMessage') ? $this->latestMessage : $this->messages->last();
        $messages = $this->whenLoaded('messages', $this->messages, collect());
        $unread = (int) ($this->unread_count ?? $this->unreadCountFor($user));

        return [
            'id' => (string) $this->id,
            'status' => $this->status,
            'displayStatus' => $this->displayStatus($unread),
            'subject' => $this->subjectLabel(),
            'preview' => $latest?->body ? \Illuminate\Support\Str::limit($latest->body, 80) : '',
            'lastMessageAt' => ($this->last_message_at ?? $latest?->created_at)?->toIso8601String(),
            'unreadCount' => $unread,
            'buyer' => $this->whenLoaded('buyer', fn () => $this->buyer ? [
                'id' => (string) $this->buyer->id,
                'name' => $this->buyer->name,
                'email' => $this->buyer->email,
                'phone' => $this->buyer->phone,
                'avatar' => $this->buyer->avatar_path,
            ] : null),
            'store' => $this->whenLoaded('store', fn () => $this->store ? [
                'id' => (string) $this->store->id,
                'name' => $this->store->name,
                'slug' => $this->store->slug,
            ] : null),
            'order' => $this->whenLoaded('order', fn () => $this->order ? [
                'id' => (string) $this->order->id,
                'reference' => $this->order->reference,
                'total' => (float) $this->order->total,
                'createdAt' => $this->order->created_at?->toIso8601String(),
            ] : null),
            'messages' => $messages->map(fn (Message $message) => [
                'id' => (string) $message->id,
                'body' => $message->body,
                'senderRole' => $message->sender_id === $this->buyer_id ? 'customer' : 'merchant',
                'senderId' => (string) $message->sender_id,
                'mine' => $user ? $message->sender_id === $user->id : false,
                'createdAt' => $message->created_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    private function unreadCountFor(?User $user): int
    {
        if (! $user) {
            return 0;
        }

        return $this->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id)
            ->count();
    }

    private function displayStatus(int $unread): string
    {
        if ($this->status === 'resolved') {
            return 'Resolved';
        }
        if ($this->status === 'in_progress') {
            return 'In Progress';
        }

        return $unread > 0 ? 'New' : 'In Progress';
    }

    private function subjectLabel(): string
    {
        if ($this->relationLoaded('order') && $this->order) {
            return 'Order '.$this->order->reference;
        }
        if ($this->relationLoaded('product') && $this->product) {
            return $this->product->name;
        }

        return 'Store inquiry';
    }
}
