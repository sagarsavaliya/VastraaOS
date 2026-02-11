<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowTaskComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_task_id',
        'user_id',
        'comment',
        'attachment_url',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(OrderWorkflowTask::class, 'workflow_task_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
