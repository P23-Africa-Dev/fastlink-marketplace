<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->with('actor')->orderByDesc('id');

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('action', 'like', $q)
                    ->orWhereHas('actor', fn ($actor) => $actor->where('name', 'like', $q)->orWhere('email', 'like', $q));
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $logs = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            AuditLogResource::collection($logs)->resolve(),
            $total,
            $page,
            $limit,
        );
    }
}
