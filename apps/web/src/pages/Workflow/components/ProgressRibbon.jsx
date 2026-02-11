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
    const [hoveredStage, setHoveredStage] = useState(null);

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
            case 'current': return 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse-fast border-primary';
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

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold h-3">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={`truncate transition-colors duration-300 ${hoveredStage ? 'text-primary' : 'text-text-muted'}`}>
                        {hoveredStage ? hoveredStage.name : (percentage === 100 ? 'Completed' : 'Workflow Progress')}
                    </span>
                    {hoveredStage && (
                        <>
                            <span className="text-text-muted/40">•</span>
                            <span className="text-text-muted truncate lowercase font-medium">
                                {tasks.find(t => t.workflow_stage_id === hoveredStage.id)?.worker?.display_name || 'System'}
                            </span>
                        </>
                    )}
                </div>
                <span className="text-text-main tabular-nums ml-2 shrink-0">
                    {hoveredStage ? getStatusText(getStageStatus(hoveredStage.id)) : `${percentage}%`}
                </span>
            </div>

            <div className="flex gap-1 h-3 w-full rounded-full overflow-hidden bg-background-content/10">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        className={`
                            flex-1 h-full rounded-full transition-all duration-300 cursor-help border
                            ${getStatusStyle(getStageStatus(stage.id))}
                            ${hoveredStage?.id === stage.id ? 'brightness-110 z-10 shadow-lg' : ''}
                        `}
                        onMouseEnter={() => setHoveredStage(stage)}
                        onMouseLeave={() => setHoveredStage(null)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProgressRibbon;
