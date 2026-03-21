<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ExpenseGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    /**
     * Dashboard KPIs and summary
     */
    public function dashboard(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');
        $month = $request->get('month');
        $year = $request->get('year');
        $consolidated = $request->boolean('consolidated');

        $baseQuery = Expense::where('tenant_id', $tenantId)
            ->where('status', 'approved');

        if (!$consolidated && $month && $year) {
            $baseQuery->whereMonth('expense_date', $month)->whereYear('expense_date', $year);
        } elseif (!$consolidated && $year) {
            $baseQuery->whereYear('expense_date', $year);
        }

        $totalApproved = (clone $baseQuery)->sum('amount');
        $businessTotal = (clone $baseQuery)->where('expense_type', 'business')->sum('amount');
        $personalTotal = (clone $baseQuery)->where('expense_type', 'personal')->sum('amount');

        $pendingCount = Expense::where('tenant_id', $tenantId)->where('status', 'pending_approval')->count();
        $pendingAmount = Expense::where('tenant_id', $tenantId)->where('status', 'pending_approval')->sum('amount');

        $byCategory = (clone $baseQuery)
            ->selectRaw('category_id, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(fn($e) => [
                'category' => $e->category?->name ?? 'Uncategorized',
                'color' => $e->category?->color ?? '#64748b',
                'total' => (float) $e->total,
                'count' => $e->count,
            ]);

        $byPaymentMethod = (clone $baseQuery)
            ->selectRaw('payment_method, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_method')
            ->get()
            ->map(fn($e) => [
                'method' => $e->payment_method ?? 'Other',
                'total' => (float) $e->total,
                'count' => $e->count,
            ]);

        $trend = Expense::where('tenant_id', $tenantId)
            ->where('status', 'approved')
            ->where('expense_date', '>=', now()->subMonths(5)->startOfMonth())
            ->selectRaw('YEAR(expense_date) as year, MONTH(expense_date) as month, SUM(amount) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get()
            ->map(fn($r) => [
                'label' => date('M Y', mktime(0, 0, 0, $r->month, 1, $r->year)),
                'total' => (float) $r->total,
            ]);

        $recentPending = Expense::where('tenant_id', $tenantId)
            ->where('status', 'pending_approval')
            ->with(['category', 'submittedBy', 'employee'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'total_approved' => (float) $totalApproved,
                'business_total' => (float) $businessTotal,
                'personal_total' => (float) $personalTotal,
                'pending_count' => $pendingCount,
                'pending_amount' => (float) $pendingAmount,
                'by_category' => $byCategory,
                'by_payment_method' => $byPaymentMethod,
                'trend' => $trend,
                'recent_pending' => $recentPending,
            ],
        ]);
    }

    /**
     * List expenses
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        $query = Expense::where('tenant_id', $tenantId)
            ->with(['category', 'submittedBy', 'approvedBy', 'group', 'employee']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('expense_type')) {
            $query->where('expense_type', $request->expense_type);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('group_id')) {
            $query->where('expense_group_id', $request->group_id);
        }
        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('expense_date', $request->month)->whereYear('expense_date', $request->year);
        } elseif ($request->filled('year')) {
            $query->whereYear('expense_date', $request->year);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('vendor_name', 'like', "%{$search}%")
                ->orWhere('expense_number', 'like', "%{$search}%")
            );
        }

        $user = $request->user();
        if (!$user->hasRole(['owner', 'manager'])) {
            $query->where('submitted_by_user_id', $user->id);
        }

        $sortBy = $request->get('sort_by', 'expense_date');
        $sortDir = $request->get('sort_dir', 'desc');
        if (in_array($sortBy, ['expense_date', 'amount', 'title', 'status', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    /**
     * Create expense
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'category_id'      => 'nullable|exists:expense_categories,id',
            'expense_group_id' => 'nullable|exists:expense_groups,id',
            'employee_user_id' => 'nullable|exists:users,id',
            'expense_type'     => 'required|in:business,personal',
            'amount'           => 'required|numeric|min:0.01',
            'expense_date'     => 'required|date',
            'payment_method'   => 'nullable|in:cash,upi,card,bank_transfer,cheque,other',
            'vendor_name'      => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:100',
            'is_reimbursable'  => 'boolean',
            'notes'            => 'nullable|string',
        ]);

        $tenantId = app('tenant_id');

        $lastExpense = Expense::where('tenant_id', $tenantId)->latest('id')->first();
        $nextNum = $lastExpense ? ((int) substr($lastExpense->expense_number, 4)) + 1 : 1;
        $expenseNumber = 'EXP-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $category = $validated['category_id'] ? ExpenseCategory::find($validated['category_id']) : null;
        $requiresApproval = $category ? $category->requires_approval : true;
        $status = $requiresApproval ? 'pending_approval' : 'approved';

        $expense = Expense::create(array_merge($validated, [
            'tenant_id'           => $tenantId,
            'expense_number'      => $expenseNumber,
            'submitted_by_user_id' => $request->user()->id,
            'status'              => $status,
            'approved_by_user_id' => !$requiresApproval ? $request->user()->id : null,
            'approved_at'         => !$requiresApproval ? now() : null,
            'receipts'            => [],
        ]));

        return response()->json([
            'message' => 'Expense submitted successfully',
            'data'    => $expense->load(['category', 'submittedBy', 'group', 'employee']),
        ], 201);
    }

    /**
     * Show single expense
     */
    public function show(Expense $expense): JsonResponse
    {
        return response()->json([
            'data' => $expense->load(['category', 'submittedBy', 'approvedBy', 'group', 'employee']),
        ]);
    }

    /**
     * Update expense
     */
    public function update(Request $request, Expense $expense): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['owner', 'manager']) && $expense->submitted_by_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if (!in_array($expense->status, ['draft', 'pending_approval'])) {
            return response()->json(['message' => 'Cannot edit an approved or rejected expense'], 422);
        }

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'description'      => 'nullable|string',
            'category_id'      => 'nullable|exists:expense_categories,id',
            'expense_group_id' => 'nullable|exists:expense_groups,id',
            'employee_user_id' => 'nullable|exists:users,id',
            'expense_type'     => 'sometimes|in:business,personal',
            'amount'           => 'sometimes|numeric|min:0.01',
            'expense_date'     => 'sometimes|date',
            'payment_method'   => 'nullable|in:cash,upi,card,bank_transfer,cheque,other',
            'vendor_name'      => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:100',
            'is_reimbursable'  => 'boolean',
            'notes'            => 'nullable|string',
        ]);

        $expense->update($validated);

        return response()->json([
            'message' => 'Expense updated successfully',
            'data'    => $expense->fresh()->load(['category', 'submittedBy', 'group', 'employee']),
        ]);
    }

    /**
     * Upload a receipt file for an expense
     */
    public function uploadReceipt(Request $request, Expense $expense): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['owner', 'manager']) && $expense->submitted_by_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf,webp|max:5120',
        ]);

        $file = $request->file('receipt');
        $path = $file->store("expenses/{$expense->id}/receipts", 'public');
        $url  = Storage::url($path);

        $receipts = $expense->receipts ?? [];
        $receipts[] = [
            'path' => $path,
            'url'  => $url,
            'name' => $file->getClientOriginalName(),
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ];

        $expense->update(['receipts' => $receipts]);

        return response()->json([
            'message'  => 'Receipt uploaded',
            'receipts' => $expense->receipts,
        ]);
    }

    /**
     * Delete a receipt by index
     */
    public function deleteReceipt(Expense $expense, int $index): JsonResponse
    {
        $receipts = $expense->receipts ?? [];
        if (!isset($receipts[$index])) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        Storage::disk('public')->delete($receipts[$index]['path']);
        array_splice($receipts, $index, 1);
        $expense->update(['receipts' => array_values($receipts)]);

        return response()->json(['message' => 'Receipt deleted', 'receipts' => $expense->receipts]);
    }

    /**
     * Approve expense
     */
    public function approve(Request $request, Expense $expense): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['owner', 'manager'])) {
            return response()->json(['message' => 'Only managers can approve expenses'], 403);
        }
        if ($expense->status !== 'pending_approval') {
            return response()->json(['message' => 'Only pending expenses can be approved'], 422);
        }

        $validated = $request->validate(['approval_notes' => 'nullable|string|max:500']);

        $expense->update([
            'status'              => 'approved',
            'approved_by_user_id' => $user->id,
            'approved_at'         => now(),
            'approval_notes'      => $validated['approval_notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Expense approved',
            'data'    => $expense->fresh()->load(['category', 'submittedBy', 'approvedBy', 'group', 'employee']),
        ]);
    }

    /**
     * Reject expense
     */
    public function reject(Request $request, Expense $expense): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['owner', 'manager'])) {
            return response()->json(['message' => 'Only managers can reject expenses'], 403);
        }
        if ($expense->status !== 'pending_approval') {
            return response()->json(['message' => 'Only pending expenses can be rejected'], 422);
        }

        $validated = $request->validate(['rejection_reason' => 'required|string|max:500']);

        $expense->update([
            'status'              => 'rejected',
            'rejection_reason'    => $validated['rejection_reason'],
            'approved_by_user_id' => $user->id,
            'approved_at'         => now(),
        ]);

        return response()->json([
            'message' => 'Expense rejected',
            'data'    => $expense->fresh()->load(['category', 'submittedBy', 'approvedBy', 'group', 'employee']),
        ]);
    }

    /**
     * Delete expense
     */
    public function destroy(Request $request, Expense $expense): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['owner', 'manager']) && $expense->submitted_by_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($expense->status === 'approved') {
            return response()->json(['message' => 'Cannot delete an approved expense'], 422);
        }
        $expense->delete();
        return response()->json(['message' => 'Expense deleted successfully']);
    }

    /**
     * List expense categories
     */
    public function categories(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');
        $categories = ExpenseCategory::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $categories]);
    }

    /**
     * Create expense category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:100',
            'type'              => 'required|in:business,personal',
            'requires_approval' => 'boolean',
            'color'             => 'nullable|string|max:20',
        ]);

        $category = ExpenseCategory::create(array_merge($validated, [
            'tenant_id' => app('tenant_id'),
        ]));

        return response()->json(['message' => 'Category created', 'data' => $category], 201);
    }

    /**
     * List expense groups (heads)
     */
    public function groups(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');
        $groups = ExpenseGroup::where('tenant_id', $tenantId)
            ->withCount('expenses')
            ->withSum('expenses', 'amount')
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $groups]);
    }

    /**
     * Create expense group (head)
     */
    public function storeGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $group = ExpenseGroup::create(array_merge($validated, [
            'tenant_id' => app('tenant_id'),
        ]));

        return response()->json(['message' => 'Expense group created', 'data' => $group], 201);
    }
}
