<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class OrderNumberSequence extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'sequence_type',
        'prefix',
        'suffix',
        'current_number',
        'padding_length',
        'fiscal_year',
        'reset_yearly',
        'last_reset_date',
    ];

    protected $casts = [
        'current_number' => 'integer',
        'padding_length' => 'integer',
        'reset_yearly' => 'boolean',
        'last_reset_date' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Generate the next number in sequence
     */
    public function getNextNumber(): string
    {
        return DB::transaction(function () {
            // Lock the row for update
            $sequence = self::where('id', $this->id)->lockForUpdate()->first();

            // Check if fiscal year reset is needed
            if ($sequence->reset_yearly) {
                $currentFiscalYear = $this->getCurrentFiscalYear();
                if ($sequence->fiscal_year !== $currentFiscalYear) {
                    $sequence->fiscal_year = $currentFiscalYear;
                    $sequence->current_number = 0;
                    $sequence->last_reset_date = now();
                }
            }

            // Increment and save
            $sequence->current_number++;
            $sequence->save();

            // Format the number
            return $this->formatNumber($sequence);
        });
    }

    /**
     * Format the sequence number
     */
    protected function formatNumber(self $sequence): string
    {
        $paddedNumber = str_pad($sequence->current_number, $sequence->padding_length, '0', STR_PAD_LEFT);

        $parts = [];

        if ($sequence->prefix) {
            $parts[] = $sequence->prefix;
        }

        if ($sequence->fiscal_year) {
            $parts[] = $sequence->fiscal_year;
        }

        $parts[] = $paddedNumber;

        if ($sequence->suffix) {
            $parts[] = $sequence->suffix;
        }

        return implode('', $parts);
    }

    /**
     * Get the current Indian fiscal year (April to March)
     */
    protected function getCurrentFiscalYear(): string
    {
        $month = (int) date('n');
        $year = (int) date('Y');

        if ($month < 4) {
            // Jan-Mar belongs to previous fiscal year
            return ($year - 1) . '-' . substr($year, 2);
        }

        return $year . '-' . substr($year + 1, 2);
    }
}
