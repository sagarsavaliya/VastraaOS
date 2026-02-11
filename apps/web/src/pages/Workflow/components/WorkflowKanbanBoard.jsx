import React from 'react';
import { Calendar, User, Camera, AlertTriangle } from 'lucide-react';

const WorkflowKanbanBoard = ({ boardData = [], onTaskClick }) => {
    if (!boardData || boardData.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-text-muted">No workflow stages found</p>
            </div>
        );
    }

    const getPriorityStyle = (color) => ({
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`
    });

    return (
        <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-4 min-w-max">
                {boardData.map((stage) => (
                    <div key={stage.id} className="flex-shrink-0 w-80">
                        {/* Stage Header */}
                        <div
                            className="sticky top-0 z-10 px-4 py-3 rounded-t-xl border-b-2 bg-background-content/80 backdrop-blur-sm"
                            style={{ borderBottomColor: stage.color || '#6366f1' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stage.color || '#6366f1' }}
                                    />
                                    <h3 className="font-bold text-text-main">{stage.name}</h3>
                                </div>
                                <span className="px-2 py-1 bg-background rounded-full text-xs font-bold text-text-muted">
                                    {stage.tasks?.length || 0}
                                </span>
                            </div>
                        </div>

                        {/* Tasks Column */}
                        <div className="bg-background-content/30 rounded-b-xl border border-t-0 border-border min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-hide p-3 space-y-3">
                            {stage.tasks && stage.tasks.length > 0 ? (
                                stage.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick && onTaskClick(task)}
                                        className="bg-surface p-4 rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        {/* Order Number */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-primary group-hover:text-primary-hover">
                                                {task.order_number}
                                            </span>
                                            {task.is_overdue && (
                                                <AlertTriangle size={16} className="text-error" />
                                            )}
                                        </div>

                                        {/* Customer & Item */}
                                        <p className="text-sm font-medium text-text-main mb-1">
                                            {task.customer_name}
                                        </p>
                                        <p className="text-xs text-text-muted mb-3">
                                            {task.item_name}
                                        </p>

                                        {/* Priority Badge */}
                                        {task.priority && (
                                            <div className="mb-3">
                                                <span
                                                    className="inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                                    style={getPriorityStyle(task.priority_color)}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>
                                        )}

                                        {/* Footer Info */}
                                        <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                <span className={task.is_overdue ? 'text-error font-bold' : ''}>
                                                    {task.due_date || 'No due date'}
                                                </span>
                                            </div>
                                            {task.assigned_to && (
                                                <div className="flex items-center gap-1">
                                                    <User size={12} />
                                                    <span>{task.assigned_to}</span>
                                                </div>
                                            )}
                                            {task.has_photos && (
                                                <div className="flex items-center gap-1">
                                                    <Camera size={12} className={task.photo_verified ? 'text-success' : 'text-warning'} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center py-12">
                                    <p className="text-sm text-text-muted">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowKanbanBoard;
