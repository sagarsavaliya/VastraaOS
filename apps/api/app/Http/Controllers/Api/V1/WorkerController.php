<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OrderNumberSequence;
use App\Models\Worker;
use App\Models\WorkerSkill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkerController extends Controller
{
    /**
     * List workers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Worker::query()
            ->with(['skills.workType']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('worker_code', 'like', "%{$search}%");
            });
        }

        // Filter by skill/work type
        if ($request->has('work_type_id')) {
            $query->whereHas('skills', fn($q) => $q->where('work_type_id', $request->work_type_id));
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $query->orderBy('display_name', 'asc');

        $workers = $query->paginate($request->get('per_page', 15));

        return response()->json($workers);
    }

    /**
     * Get worker statistics
     */
    public function stats(): JsonResponse
    {
        $tenantId = app('tenant_id');

        $totalWorkers = Worker::count();
        $activeWorkers = Worker::where('is_active', true)->count();
        
        // Workers with pending tasks (from order_workflow_tasks)
        $workersWithPendingTasks = Worker::whereHas('assignedTasks', function($q) {
            $q->whereNotIn('status', ['completed', 'skipped']);
        })->count();

        // Workers with pending embellishments
        $workersWithPendingEmbellishments = Worker::whereHas('assignedEmbellishments', function($q) {
            $q->whereNotIn('status', ['completed', 'cancelled']);
        })->count();

        return response()->json([
            'total' => $totalWorkers,
            'active' => $activeWorkers,
            'with_pending_tasks' => $workersWithPendingTasks,
            'with_pending_embellishments' => $workersWithPendingEmbellishments,
        ]);
    }

    /**
     * Create worker
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'display_name' => 'required|string|max:255',
            'mobile' => 'required|string|max:15',
            'alternate_mobile' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'default_rate' => 'nullable|numeric|min:0',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_ifsc_code' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:100',
            'upi_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'skills' => 'nullable|array',
            'skills.*.work_type_id' => 'required|exists:work_types,id',
            'skills.*.proficiency_level' => 'nullable|in:beginner,intermediate,expert',
            'skills.*.rate_per_piece' => 'nullable|numeric|min:0',
        ]);

        // Generate worker code
        $validated['worker_code'] = $this->generateWorkerCode();
        $validated['tenant_id'] = app('tenant_id');
        $validated['is_active'] = $validated['is_active'] ?? true;

        $skills = $validated['skills'] ?? [];
        unset($validated['skills']);

        $worker = Worker::create($validated);

        // Add skills
        foreach ($skills as $skill) {
            $worker->skills()->create($skill);
        }

        return response()->json([
            'message' => 'Worker created successfully',
            'data' => $worker->load('skills.workType'),
        ], 201);
    }

    /**
     * Get worker details
     */
    public function show(Worker $worker): JsonResponse
    {
        $worker->load(['skills.workType']);

        return response()->json([
            'data' => $worker,
        ]);
    }

    /**
     * Update worker
     */
    public function update(Request $request, Worker $worker): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'display_name' => 'sometimes|string|max:255',
            'mobile' => 'sometimes|string|max:15',
            'alternate_mobile' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'default_rate' => 'nullable|numeric|min:0',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_ifsc' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:100',
            'upi_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'skills' => 'nullable|array',
            'skills.*.work_type_id' => 'required|exists:work_types,id',
            'skills.*.proficiency_level' => 'nullable|in:beginner,intermediate,expert',
            'skills.*.rate_per_piece' => 'nullable|numeric|min:0',
        ]);

        $skills = $validated['skills'] ?? null;
        unset($validated['skills']);

        $worker->update($validated);

        // Sync skills if provided
        if ($skills !== null) {
            $worker->skills()->delete();
            foreach ($skills as $skill) {
                $worker->skills()->create($skill);
            }
        }

        return response()->json([
            'message' => 'Worker updated successfully',
            'data' => $worker->fresh()->load('skills.workType'),
        ]);
    }

    /**
     * Delete worker (soft delete)
     */
    public function destroy(Worker $worker): JsonResponse
    {
        // Check for active assignments
        $activeAssignments = $worker->embellishments()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        if ($activeAssignments > 0) {
            return response()->json([
                'message' => 'Cannot delete worker with active assignments',
            ], 422);
        }

        $worker->delete();

        return response()->json([
            'message' => 'Worker deleted successfully',
        ]);
    }

    /**
     * Get worker skills
     */
    public function skills(Worker $worker): JsonResponse
    {
        $skills = $worker->skills()->with('workType')->get();

        return response()->json([
            'data' => $skills,
        ]);
    }

    /**
     * Add skill to worker
     */
    public function addSkill(Request $request, Worker $worker): JsonResponse
    {
        $validated = $request->validate([
            'work_type_id' => 'required|exists:work_types,id',
            'proficiency_level' => 'nullable|in:beginner,intermediate,expert',
            'rate_per_piece' => 'nullable|numeric|min:0',
        ]);

        // Check if skill already exists
        $existing = $worker->skills()->where('work_type_id', $validated['work_type_id'])->first();

        if ($existing) {
            $existing->update($validated);
            $skill = $existing;
        } else {
            $skill = $worker->skills()->create($validated);
        }

        return response()->json([
            'message' => 'Skill added successfully',
            'data' => $skill->load('workType'),
        ], 201);
    }

    /**
     * Remove skill from worker
     */
    public function removeSkill(Worker $worker, WorkerSkill $skill): JsonResponse
    {
        if ($skill->worker_id !== $worker->id) {
            return response()->json([
                'message' => 'Skill does not belong to this worker',
            ], 404);
        }

        $skill->delete();

        return response()->json([
            'message' => 'Skill removed successfully',
        ]);
    }

    /**
     * Get worker assignments
     */
    public function assignments(Worker $worker): JsonResponse
    {
        $embellishments = $worker->embellishments()
            ->with(['orderItem.order.customer', 'workType'])
            ->latest()
            ->paginate(15);

        $additionalWorks = $worker->additionalWorks()
            ->with(['orderItem.order.customer'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'embellishments' => $embellishments,
            'additional_works' => $additionalWorks,
        ]);
    }

    /**
     * Generate worker code
     */
    private function generateWorkerCode(): string
    {
        $tenantId = app('tenant_id');

        $sequence = OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'worker')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        // Fallback
        $lastWorker = Worker::latest('id')->first();
        $nextNumber = $lastWorker ? $lastWorker->id + 1 : 1;

        return 'WRK-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
