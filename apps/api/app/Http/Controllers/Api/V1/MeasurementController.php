<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\MeasurementProfile;
use App\Models\MeasurementRecord;
use App\Models\MeasurementValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeasurementController extends Controller
{
    /**
     * Get measurement profiles for a customer
     */
    public function profiles(Customer $customer): JsonResponse
    {
        $profiles = $customer->measurementProfiles()
            ->with(['latestRecord.measurementValues.measurementType'])
            ->orderBy('is_default', 'desc')
            ->orderBy('profile_name')
            ->get();

        return response()->json([
            'data' => $profiles,
        ]);
    }

    /**
     * Create measurement profile
     */
    public function createProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'profile_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        $validated['tenant_id'] = app('tenant_id');

        // If setting as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            MeasurementProfile::where('customer_id', $validated['customer_id'])
                ->update(['is_default' => false]);
        }

        // If a soft-deleted profile with the same name exists, restore it
        $existing = MeasurementProfile::withTrashed()
            ->where('customer_id', $validated['customer_id'])
            ->where('profile_name', $validated['profile_name'])
            ->whereNotNull('deleted_at')
            ->first();

        if ($existing) {
            $existing->restore();
            $existing->update([
                'description' => $validated['description'] ?? null,
                'is_default'  => $validated['is_default'] ?? false,
            ]);
            return response()->json([
                'message' => 'Measurement profile restored successfully',
                'data' => $existing->fresh(),
            ], 201);
        }

        $profile = MeasurementProfile::create($validated);

        return response()->json([
            'message' => 'Measurement profile created successfully',
            'data' => $profile,
        ], 201);
    }

    /**
     * Update measurement profile
     */
    public function updateProfile(Request $request, MeasurementProfile $profile): JsonResponse
    {
        $validated = $request->validate([
            'profile_name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        // If setting as default, unset other defaults
        if (($validated['is_default'] ?? false) && !$profile->is_default) {
            MeasurementProfile::where('customer_id', $profile->customer_id)
                ->where('id', '!=', $profile->id)
                ->update(['is_default' => false]);
        }

        $profile->update($validated);

        return response()->json([
            'message' => 'Measurement profile updated successfully',
            'data' => $profile->fresh(),
        ]);
    }

    /**
     * Delete measurement profile
     */
    public function deleteProfile(MeasurementProfile $profile): JsonResponse
    {
        // Check if profile is used in any orders
        $usedInOrders = DB::table('orders')
            ->where('measurement_profile_id', $profile->id)
            ->exists();

        if ($usedInOrders) {
            return response()->json([
                'message' => 'Cannot delete profile that is used in orders',
            ], 422);
        }

        $profile->delete();

        return response()->json([
            'message' => 'Measurement profile deleted successfully',
        ]);
    }

    /**
     * Get measurement records for a profile
     */
    public function records(MeasurementProfile $profile): JsonResponse
    {
        $records = $profile->measurementRecords()
            ->with(['measurementValues.measurementType', 'recordedBy'])
            ->orderBy('measurement_date', 'desc')
            ->get();

        return response()->json([
            'data' => $records,
        ]);
    }

    /**
     * Create measurement record
     */
    public function createRecord(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'measurement_profile_id' => 'required|exists:measurement_profiles,id',
            'record_name' => 'required|string|max:50',
            'measurement_date' => 'required|date',
            'notes' => 'nullable|string',
            'measurements' => 'required|array|min:1',
            'measurements.*.measurement_type_id' => 'required|exists:measurement_types,id',
            'measurements.*.value' => 'required|numeric',
            'measurements.*.notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $record = MeasurementRecord::create([
                'tenant_id' => app('tenant_id'),
                'measurement_profile_id' => $validated['measurement_profile_id'],
                'record_name' => $validated['record_name'],
                'recorded_date' => $validated['measurement_date'],
                'recorded_by_user_id' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
                'is_latest' => true,
            ]);

            // Mark this as latest and unmark previous
            $record->markAsLatest();


            foreach ($validated['measurements'] as $measurement) {
                MeasurementValue::create([
                    'measurement_record_id' => $record->id,
                    'measurement_type_id' => $measurement['measurement_type_id'],
                    'value' => $measurement['value'],
                    'notes' => $measurement['notes'] ?? null,
                ]);
            }

            // Update profile's latest record
            $profile = MeasurementProfile::find($validated['measurement_profile_id']);
            $profile->update(['last_measured_at' => $validated['measurement_date']]);

            return response()->json([
                'message' => 'Measurement record created successfully',
                'data' => $record->load(['measurementValues.measurementType', 'recordedBy']),
            ], 201);
        });
    }

    /**
     * Get measurement record
     */
    public function showRecord(MeasurementRecord $record): JsonResponse
    {
        $record->load(['measurementValues.measurementType', 'recordedBy', 'measurementProfile.customer']);

        return response()->json([
            'data' => $record,
        ]);
    }

    /**
     * Update a measurement record (name, date, notes, set as default)
     */
    public function updateRecord(Request $request, MeasurementRecord $record): JsonResponse
    {
        $validated = $request->validate([
            'record_name'      => 'sometimes|string|max:50',
            'recorded_date'    => 'sometimes|date',
            'notes'            => 'nullable|string',
            'is_latest'        => 'sometimes|boolean',
        ]);

        if (!empty($validated['is_latest'])) {
            $record->markAsLatest();
            unset($validated['is_latest']);
        }

        $record->update($validated);

        return response()->json([
            'message' => 'Measurement record updated',
            'data'    => $record->fresh()->load('measurementValues.measurementType'),
        ]);
    }

    /**
     * Delete a measurement record and its values
     */
    public function deleteRecord(MeasurementRecord $record): JsonResponse
    {
        $profileId = $record->measurement_profile_id;
        $wasLatest = $record->is_latest;

        $record->measurementValues()->delete();
        $record->delete();

        // If we deleted the latest, promote the most recent remaining record
        if ($wasLatest) {
            $next = MeasurementRecord::where('measurement_profile_id', $profileId)
                ->latest('recorded_date')
                ->first();
            $next?->markAsLatest();
        }

        return response()->json(['message' => 'Measurement record deleted']);
    }
}
