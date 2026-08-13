<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $message, int $status = 400, mixed $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    /**
     * @param  list<mixed>  $items
     */
    public static function paginated(array $items, int $total, int $page, int $limit, ?string $message = null): JsonResponse
    {
        $limit = max(1, $limit);
        $totalPages = max(1, (int) ceil($total / $limit));

        return self::success([
            'data' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages,
            'hasNextPage' => $page < $totalPages && $total > 0,
            'hasPrevPage' => $page > 1,
        ], $message);
    }
}
