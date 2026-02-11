<?php

namespace App\Models\Traits;

use OwenIt\Auditing\Contracts\Auditable;

trait HasAuditLog
{
    /**
     * Attributes to include in audit
     */
    protected $auditInclude = [];

    /**
     * Attributes to exclude from audit
     */
    protected $auditExclude = [
        'password',
        'remember_token',
    ];

    /**
     * Should audit timestamps
     */
    protected $auditTimestamps = false;

    /**
     * Generate audit tags
     */
    public function generateTags(): array
    {
        return [];
    }
}
