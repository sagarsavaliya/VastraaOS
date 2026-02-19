import React, { useState } from 'react';

/**
 * ProgressRibbon
 * A compact, horizontal ribbon showing the status of all workflow stages.
 */
const ProgressRibbon = ({
    stages = [],
    tasks = [],
    currentStageId,
    completedStageIds = [],
    skippedStageIds = [],
    overdueStageIds = []
}) => {
    const getStageStatus = (stageId) => {
        if (completedStageIds.includes(stageId)) return 'completed';
        if (skippedStageIds.includes(stageId)) return 'skipped';
        if (overdueStageIds.includes(stageId)) return 'overdue';
        if (stageId === currentStageId) return 'current';
        return 'pending';
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-success border-success';
            case 'skipped': return 'bg-text-muted opacity-30 border-text-muted';
            case 'overdue': return 'bg-error animate-pulse-fast border-error';
            case 'current': return 'bg-primary animate-pulse-fast border-primary';
            default: return 'bg-transparent border-border/40';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'skipped': return 'Skipped';
            case 'overdue': return 'Overdue';
            case 'current': return 'In Progress';
            default: return 'Pending';
        }
    };

    // Calculate percentage based on completed/skipped stages
    const totalStages = stages.length || 1;
    const completedCount = completedStageIds.length + skippedStageIds.length;
    const percentage = Math.round((completedCount / totalStages) * 100);

    const activeStage = stages.find(s => s.id === currentStageId) ||
        (percentage === 100 ? stages[stages.length - 1] : stages[0]);
    const activeTask = activeStage ? tasks.find(t => t.workflow_stage_id === activeStage.id) : null;
    const activeStatus = activeStage ? getStageStatus(activeStage.id) : 'pending';

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold h-3">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="truncate text-primary">
                        {activeStage?.name || (percentage === 100 ? 'Completed' : 'Workflow Progress')}
                    </span>
                    {activeStage && (
                        <>
                            <span className="text-text-muted/40">•</span>
                            <span className="text-text-muted truncate lowercase font-medium">
                                {activeTask?.worker?.display_name ||
                                    activeTask?.assigned_worker?.display_name ||
                                    activeTask?.assigned_user?.name ||
                                    activeTask?.assigned_to_user?.name ||
                                    'System'}
                            </span>
                        </>
                    )}
                </div>
                <span className="text-text-main tabular-nums ml-2 shrink-0">
                    {getStatusText(activeStatus)}
                </span>
            </div>

            <div className="flex gap-1 h-3 w-full rounded-full overflow-hidden bg-background-content/10">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        className={`
                            flex-1 h-full rounded-full transition-all duration-300 border
                            ${getStatusStyle(getStageStatus(stage.id))}
                        `}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProgressRibbon;
