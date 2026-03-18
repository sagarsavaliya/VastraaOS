import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, SkipForward, XCircle, User } from 'lucide-react';

const WorkflowTimeline = ({
    stages = [],
    currentStageId,
    completedStageIds = [],
    skippedStageIds = [],
    overdueStageIds = [],
    workflowTasks = [],          // full task objects with assignee info
    onStageClick,                // (task) => void — for managers to assign per stage
    canAssign = false,
}) => {
    // Build a map of stage_id → task for quick lookup
    const taskByStage = workflowTasks.reduce((acc, t) => {
        acc[t.workflow_stage_id] = t;
        return acc;
    }, {});

    const getStageStatus = (stage) => {
        if (completedStageIds.includes(stage.id)) return 'completed';
        if (skippedStageIds.includes(stage.id)) return 'skipped';
        const task = taskByStage[stage.id];
        if (task?.status === 'rejected') return 'rejected';
        if (stage.id === currentStageId) return 'current';
        if (overdueStageIds.includes(stage.id)) return 'overdue';
        return 'pending';
    };

    const getStageIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={18} className="text-success" />;
            case 'current':   return <Clock size={18} className="text-primary animate-pulse" />;
            case 'skipped':   return <SkipForward size={18} className="text-warning" />;
            case 'overdue':   return <AlertCircle size={18} className="text-error" />;
            case 'rejected':  return <XCircle size={18} className="text-rose-500" />;
            default:          return <Circle size={18} className="text-text-muted" />;
        }
    };

    const getNodeStyles = (status) => {
        switch (status) {
            case 'completed': return 'bg-success/10 border-2 border-success';
            case 'current':   return 'bg-primary/10 border-2 border-primary';
            case 'skipped':   return 'bg-warning/10 border-2 border-warning';
            case 'overdue':   return 'bg-error/10 border-2 border-error';
            case 'rejected':  return 'bg-rose-500/10 border-2 border-rose-500';
            default:          return 'bg-background-content border-2 border-border';
        }
    };

    const getTextStyles = (status) => {
        switch (status) {
            case 'completed': return 'text-success';
            case 'current':   return 'text-primary font-bold';
            case 'skipped':   return 'text-warning';
            case 'overdue':   return 'text-error';
            case 'rejected':  return 'text-rose-500';
            default:          return 'text-text-muted';
        }
    };

    const getConnectorStyles = (status, nextStatus) => {
        if (status === 'completed' && ['completed', 'current'].includes(nextStatus)) return 'border-success border-solid';
        if (status === 'skipped') return 'border-warning border-solid';
        return 'border-border border-dashed';
    };

    const completionPercentage = stages.length > 0
        ? Math.round((completedStageIds.length / stages.length) * 100)
        : 0;

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-main">Overall Progress</span>
                    <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-background-content rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="overflow-x-auto pb-4">
                <div className="flex items-start gap-0 min-w-max">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(stage);
                        const nextStatus = index < stages.length - 1 ? getStageStatus(stages[index + 1]) : null;
                        const isLast = index === stages.length - 1;
                        const task = taskByStage[stage.id];
                        const assigneeName = task?.assigned_to_worker?.display_name
                            || task?.assigned_to_user?.name
                            || null;
                        const isClickable = canAssign && ['current', 'pending'].includes(status);

                        return (
                            <div key={stage.id} className="flex items-start">
                                <div
                                    className={`flex flex-col items-center min-w-[120px] relative ${isClickable ? 'cursor-pointer group' : ''}`}
                                    onClick={() => isClickable && task && onStageClick && onStageClick(task)}
                                    title={isClickable ? `Click to assign ${stage.name}` : undefined}
                                >
                                    {/* Node */}
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all
                                        ${getNodeStyles(status)}
                                        ${isClickable ? 'group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/20' : ''}
                                    `}>
                                        {getStageIcon(status)}
                                    </div>

                                    {/* Stage name + status label */}
                                    <div className={`text-center px-1 ${getTextStyles(status)}`}>
                                        <p className="text-[10px] font-medium whitespace-nowrap mb-0.5 leading-tight">{stage.name}</p>
                                        {status === 'current' && (
                                            <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full">
                                                ACTIVE
                                            </span>
                                        )}
                                        {status === 'completed' && (
                                            <span className="text-[9px] text-success">Done</span>
                                        )}
                                        {status === 'skipped' && (
                                            <span className="text-[9px] text-warning">Skipped</span>
                                        )}
                                        {status === 'rejected' && (
                                            <span className="text-[9px] text-rose-500 font-bold">Rejected</span>
                                        )}
                                        {status === 'overdue' && (
                                            <span className="text-[9px] text-error font-bold">OVERDUE</span>
                                        )}
                                    </div>

                                    {/* Assignee chip */}
                                    {assigneeName && (
                                        <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-background-content/80 border border-border/50 rounded-full max-w-[110px]">
                                            <User size={8} className="text-text-muted flex-shrink-0" />
                                            <span className="text-[8px] text-text-muted truncate">{assigneeName}</span>
                                        </div>
                                    )}

                                    {/* "Click to assign" hint */}
                                    {isClickable && !assigneeName && (
                                        <span className="text-[8px] text-primary/60 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            assign
                                        </span>
                                    )}
                                </div>

                                {/* Connector */}
                                {!isLast && (
                                    <div className={`w-14 h-0.5 mt-[18px] border-t-2 ${getConnectorStyles(status, nextStatus)}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
                {[
                    { icon: CheckCircle, color: 'text-success', label: 'Completed' },
                    { icon: Clock,       color: 'text-primary', label: 'Active' },
                    { icon: Circle,      color: 'text-text-muted', label: 'Pending' },
                    { icon: SkipForward, color: 'text-warning', label: 'Skipped' },
                    { icon: XCircle,     color: 'text-rose-500', label: 'Rejected' },
                    { icon: AlertCircle, color: 'text-error', label: 'Overdue' },
                ].map(({ icon: Icon, color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <Icon size={14} className={color} />
                        <span className="text-[10px] text-text-muted">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowTimeline;
