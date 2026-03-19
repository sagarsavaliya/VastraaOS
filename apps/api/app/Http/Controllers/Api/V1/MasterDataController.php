<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BudgetRange;
use App\Models\EmbellishmentZone;
use App\Models\HsnCode;
use App\Models\InquirySource;
use App\Models\ItemType;
use App\Models\MeasurementType;
use App\Models\Occasion;
use App\Models\OrderPriority;
use App\Models\OrderStatus;
use App\Models\WorkflowStage;
use App\Models\WorkType;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get item types
     */
    public function itemTypes(Request $request): JsonResponse
    {
        $query = ItemType::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get work types
     */
    public function workTypes(Request $request): JsonResponse
    {
        $query = WorkType::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get embellishment zones
     */
    public function embellishmentZones(Request $request): JsonResponse
    {
        $query = EmbellishmentZone::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get inquiry sources
     */
    public function inquirySources(Request $request): JsonResponse
    {
        $query = InquirySource::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get occasions
     */
    public function occasions(Request $request): JsonResponse
    {
        $query = Occasion::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get budget ranges
     */
    public function budgetRanges(Request $request): JsonResponse
    {
        $query = BudgetRange::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get measurement types
     */
    public function measurementTypes(Request $request): JsonResponse
    {
        $query = MeasurementType::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        if ($request->has('body_section')) {
            $query->where('body_section', $request->body_section);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get workflow stages
     */
    public function workflowStages(Request $request): JsonResponse
    {
        $query = WorkflowStage::query()
            ->where('is_active', true)
            ->orderBy('stage_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get order statuses
     */
    public function orderStatuses(Request $request): JsonResponse
    {
        $query = OrderStatus::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Get order priorities
     */
    public function orderPriorities(Request $request): JsonResponse
    {
        $query = OrderPriority::query()
            ->where('is_active', true)
            ->orderBy('display_order');

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * List HSN codes: system defaults merged with tenant overrides.
     * Tenant-specific records shadow system defaults by hsn_code.
     */
    public function hsnCodes(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        // Fetch system defaults
        $systemCodes = HsnCode::whereNull('tenant_id')
            ->active()
            ->when($request->filled('search'), fn($q) => $q->where(function ($q) use ($request) {
                $q->where('hsn_code', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            }))
            ->get()
            ->keyBy('hsn_code');

        // Fetch tenant overrides
        $tenantCodes = HsnCode::where('tenant_id', $tenantId)
            ->active()
            ->when($request->filled('search'), fn($q) => $q->where(function ($q) use ($request) {
                $q->where('hsn_code', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            }))
            ->get()
            ->keyBy('hsn_code');

        // Merge: tenant overrides take precedence
        $merged = $systemCodes->merge($tenantCodes)->sortBy('hsn_code')->values();

        return response()->json([
            'success' => true,
            'message' => 'HSN codes retrieved successfully',
            'data'    => $merged,
        ]);
    }

    /**
     * Create a tenant-specific HSN code entry.
     */
    public function storeHsnCode(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        $validated = $request->validate([
            'hsn_code'    => "required|string|max:8|unique:hsn_codes,hsn_code,NULL,id,tenant_id,{$tenantId}",
            'description' => 'required|string|max:255',
            'gst_rate'    => 'required|numeric|min:0|max:100',
            'is_active'   => 'nullable|boolean',
        ]);

        $hsnCode = HsnCode::create([
            'tenant_id'   => $tenantId,
            'hsn_code'    => $validated['hsn_code'],
            'description' => $validated['description'],
            'gst_rate'    => $validated['gst_rate'],
            'is_active'   => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'HSN code created successfully',
            'data'    => $hsnCode,
        ], 201);
    }

    /**
     * Update a tenant-owned HSN code (cannot modify system defaults).
     */
    public function updateHsnCode(Request $request, int $id): JsonResponse
    {
        $tenantId = app('tenant_id');

        $hsnCode = HsnCode::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $validated = $request->validate([
            'hsn_code'    => "sometimes|string|max:8|unique:hsn_codes,hsn_code,{$id},id,tenant_id,{$tenantId}",
            'description' => 'sometimes|string|max:255',
            'gst_rate'    => 'sometimes|numeric|min:0|max:100',
            'is_active'   => 'nullable|boolean',
        ]);

        $hsnCode->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'HSN code updated successfully',
            'data'    => $hsnCode->fresh(),
        ]);
    }

    /**
     * Delete a tenant-owned HSN code (cannot delete system defaults).
     */
    public function destroyHsnCode(int $id): JsonResponse
    {
        $tenantId = app('tenant_id');

        $hsnCode = HsnCode::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $hsnCode->delete();

        return response()->json([
            'success' => true,
            'message' => 'HSN code deleted successfully',
            'data'    => null,
        ]);
    }

    /**
     * Seed default master data for the current tenant
     */
    public function seedDefaults(Request $request): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        
        if (!$tenant) {
            return response()->json(['message' => 'Tenant context not found'], 404);
        }

        try {
            $this->tenantService->seedMasterData($tenant);
            
            return response()->json([
                'message' => 'Default master data seeded successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to seed defaults',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new master data item
     */
    public function store(Request $request, string $type): JsonResponse
    {
        $model = $this->getModelForType($type);

        $validated = $request->validate($this->getValidationRules($type));

        $item = $model::create($validated);

        return response()->json([
            'message' => ucfirst(str_replace('-', ' ', $type)) . ' created successfully',
            'data' => $item,
        ], 201);
    }

    /**
     * Update a master data item
     */
    public function update(Request $request, string $type, int $id): JsonResponse
    {
        $model = $this->getModelForType($type);
        $item = $model::findOrFail($id);

        $validated = $request->validate($this->getValidationRules($type, $id));

        $item->update($validated);

        return response()->json([
            'message' => ucfirst(str_replace('-', ' ', $type)) . ' updated successfully',
            'data' => $item->fresh(),
        ]);
    }

    /**
     * Delete a master data item
     */
    public function destroy(string $type, int $id): JsonResponse
    {
        $model = $this->getModelForType($type);
        $item = $model::findOrFail($id);

        // Soft delete by setting is_active to false
        $item->update(['is_active' => false]);

        return response()->json([
            'message' => ucfirst(str_replace('-', ' ', $type)) . ' deleted successfully',
        ]);
    }

    /**
     * Get model class for type
     */
    private function getModelForType(string $type): string
    {
        return match ($type) {
            'item-types' => ItemType::class,
            'work-types' => WorkType::class,
            'embellishment-zones' => EmbellishmentZone::class,
            'inquiry-sources' => InquirySource::class,
            'occasions' => Occasion::class,
            'budget-ranges' => BudgetRange::class,
            default => throw new \InvalidArgumentException("Unknown type: {$type}"),
        };
    }

    /**
     * Get validation rules for type
     */
    private function getValidationRules(string $type, ?int $id = null): array
    {
        $baseRules = [
            'name' => 'required|string|max:100',
            'name_gujarati' => 'nullable|string|max:100',
            'name_hindi' => 'nullable|string|max:100',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ];

        return match ($type) {
            'item-types' => array_merge($baseRules, [
                'hsn_code' => 'nullable|string|max:8',
                'gst_rate' => 'nullable|numeric|min:0|max:100',
                'description' => 'nullable|string',
            ]),
            'work-types' => array_merge($baseRules, [
                'description' => 'nullable|string',
            ]),
            'embellishment-zones' => $baseRules,
            'inquiry-sources' => array_merge($baseRules, [
                'icon' => 'nullable|string|max:50',
            ]),
            'occasions' => array_merge($baseRules, [
                'color' => 'nullable|string|max:20',
            ]),
            'budget-ranges' => array_merge($baseRules, [
                'min_amount' => 'required|numeric|min:0',
                'max_amount' => 'nullable|numeric|min:0',
                'color' => 'nullable|string|max:20',
            ]),
            default => $baseRules,
        };
    }
}
