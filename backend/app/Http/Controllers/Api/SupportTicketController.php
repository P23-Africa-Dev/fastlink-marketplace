<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupportTicketResource;
use App\Models\AuditLog;
use App\Models\SupportTicket;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SupportTicket::query()->with(['store', 'user'])->orderByDesc('id');

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $this->normalizeStatus((string) $request->query('status')) ?? $request->query('status'));
        }
        if ($request->filled('priority')) {
            $query->where('priority', strtolower((string) $request->query('priority')));
        }
        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where('subject', 'like', $q);
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $tickets = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            SupportTicketResource::collection($tickets)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:40'],
            'priority' => ['nullable', 'in:high,medium,low,High,Medium,Low'],
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $store = $request->user()->role === 'seller' ? SellerContext::storeOrFail($request->user()) : $request->user()->store;

        $ticket = SupportTicket::query()->create([
            'store_id' => $store?->id,
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'] ?? 'Account',
            'priority' => strtolower($validated['priority'] ?? 'medium'),
            'status' => 'open',
        ]);
        $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return ApiResponse::success(
            (new SupportTicketResource($ticket->fresh(['store', 'user', 'messages.sender'])))->resolve(),
            'Ticket created.',
            201,
        );
    }

    public function show(Request $request, SupportTicket $ticket): JsonResponse
    {
        $this->authorizeTicket($request, $ticket);

        return ApiResponse::success(
            (new SupportTicketResource($ticket->load(['store', 'user', 'messages.sender'])))->resolve(),
        );
    }

    public function message(Request $request, SupportTicket $ticket): JsonResponse
    {
        $this->authorizeTicket($request, $ticket);
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        if ($request->user()->role === 'admin' && $ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress', 'assigned_to' => $request->user()->id]);
        }

        return ApiResponse::success(
            (new SupportTicketResource($ticket->fresh(['store', 'user', 'messages.sender'])))->resolve(),
            'Reply sent.',
        );
    }

    public function update(Request $request, SupportTicket $ticket): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:open,in_progress,resolved,Open,In Progress,Resolved'],
            'assigned_to' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = $this->normalizeStatus($validated['status']) ?? 'open';
        }

        $ticket->update($validated);
        AuditLog::record($request->user(), 'support.updated', $ticket, $validated);

        return ApiResponse::success(
            (new SupportTicketResource($ticket->fresh(['store', 'user', 'messages.sender'])))->resolve(),
            'Ticket updated.',
        );
    }

    private function authorizeTicket(Request $request, SupportTicket $ticket): void
    {
        $user = $request->user();
        if ($user->role === 'admin' || $ticket->user_id === $user->id) {
            return;
        }
        abort(403);
    }

    private function normalizeStatus(string $status): ?string
    {
        return match (strtolower($status)) {
            'open' => 'open',
            'in progress', 'in_progress' => 'in_progress',
            'resolved' => 'resolved',
            default => null,
        };
    }
}
