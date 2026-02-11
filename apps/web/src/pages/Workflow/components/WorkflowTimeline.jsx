import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, SkipForward } from 'lucide-react';

const WorkflowTimeline = ({ stages = [], currentStageId, completedStageIds = [], skippedStageIds = [], overdueStageIds = [] }) => {
    const getStageStatus = (stage) => {
        if (completedStageIds.includes(stage.id)) return 'completed';
        if (skippedStageIds.includes(stage.id)) return 'skipped';
        if (stage.id === currentStageId) return 'current';
        if (overdueStageIds.includes(stage.id)) return 'overdue';
        return 'pending';
    };

    const getStageIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={20} className="text-success" />;
            case 'current':
                return <Clock size={20} className="text-primary animate-pulse" />;
            case 'skipped':
                return <SkipForward size={20} className="text-warning" />;
            case 'overdue':
                return <AlertCircle size={20} className="text-error" />;
            default:
                return <Circle size={20} className="text-text-muted" />;
        }
    };

    const getStageStyles = (status) => {
        const baseStyles = "flex flex-col items-center min-w-[120px] relative";

        switch (status) {
            case 'completed':
                return `${baseStyles} text-success`;
            case 'current':
                return `${baseStyles} text-primary font-bold`;
            case 'skipped':
                return `${baseStyles} text-warning`;
            case 'overdue':
                return `${baseStyles} text-error`;
            default:
                return `${baseStyles} text-text-muted`;
        }
    };

    const getConnectorStyles = (status, nextStatus) => {
        if (status === 'completed' && (nextStatus === 'completed' || nextStatus === 'current')) {
            return 'border-success border-solid';
        }
        if (status === 'skipped') {
            return 'border-warning border-solid';
        }
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

                        return (
                            <div key={stage.id} className="flex items-start">
                                {/* Stage */}
                                <div className={getStageStyles(status)}>
                                    {/* Icon */}
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center mb-2
                                        ${status === 'completed' ? 'bg-success/10 border-2 border-success' : ''}
                                        ${status === 'current' ? 'bg-primary/10 border-2 border-primary' : ''}
                                        ${status === 'skipped' ? 'bg-warning/10 border-2 border-warning' : ''}
                                        ${status === 'overdue' ? 'bg-error/10 border-2 border-error' : ''}
                                        ${status === 'pending' ? 'bg-background-content border-2 border-border' : ''}
                                    `}>
                                        {getStageIcon(status)}
                                    </div>

                                    {/* Stage Name */}
                                    <div className="text-center px-2">
                                        <p className="text-xs font-medium whitespace-nowrap mb-1">
                                            {stage.name}
                                        </p>
                                        {status === 'current' && (
                                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                                                IN PROGRESS
                                            </span>
                                        )}
                                        {status === 'completed' && (
                                            <span className="text-[10px] text-success">
                                                Completed
                                            </span>
                                        )}
                                        {status === 'skipped' && (
                                            <span className="text-[10px] text-warning">
                                                Skipped
                                            </span>
                                        )}
                                        {status === 'overdue' && (
                                            <span className="text-[10px] text-error font-bold">
                                                OVERDUE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {!isLast && (
                                    <div className={`
                                        w-16 h-0.5 mt-5 border-t-2
                                        ${getConnectorStyles(status, nextStatus)}
                                    `} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-xs text-text-muted">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span className="text-xs text-text-muted">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <Circle size={16} className="text-text-muted" />
                    <span className="text-xs text-text-muted">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <SkipForward size={16} className="text-warning" />
                    <span className="text-xs text-text-muted">Skipped</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-error" />
                    <span className="text-xs text-text-muted">Overdue</span>
                </div>
            </div>
        </div>
    );
};

export default WorkflowTimeline;
