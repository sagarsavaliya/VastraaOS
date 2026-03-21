<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'expense_number', 'title', 'description', 'category_id',
        'expense_group_id', 'employee_user_id',
        'expense_type', 'amount', 'expense_date', 'payment_method', 'vendor_name',
        'status', 'submitted_by_user_id', 'approved_by_user_id', 'approved_at',
        'rejection_reason', 'approval_notes', 'receipts', 'reference_number',
        'is_reimbursable', 'is_reimbursed', 'reimbursed_at', 'notes',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'approved_at' => 'datetime',
        'reimbursed_at' => 'datetime',
        'receipts' => 'array',
        'is_reimbursable' => 'boolean',
        'is_reimbursed' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(ExpenseGroup::class, 'expense_group_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_user_id');
    }
}
