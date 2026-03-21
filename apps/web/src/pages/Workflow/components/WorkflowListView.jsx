import React from 'react';
import DataTable from '../../../components/UI/DataTable';
import ProgressRibbon from './ProgressRibbon';
import { User, Calendar, Ruler } from 'lucide-react';

const WorkflowListView = ({
    title,
    icon,
    headerAction,
    data = [],
    loading = false,
    onTaskClick,
    onPageChange,
    pagination = {},
    allStages = [],
    filters,
    searchQuery,
    onSearch,
    sortConfig,
    onSort,
    priorities = [],
    activePriorityId = '',
    onPriorityFilter,
}) => {
    const columns = [
        {
            header: 'Order Details',
            key: 'order_number',
            className: 'w-[14%]',
            accessor: (item) => {
                const missingMeasurements = !item.order?.measurement_profile_id;
                const approachingStitching = (item.current_workflow_stage?.stage_order || 0) >= 8;
                const showWarning = missingMeasurements && approachingStitching;

                return (
                    <div className="flex flex-col gap-0.5 group/item">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-text-main group-hover/item:text-primary transition-colors">
                                #{item.order?.order_number || 'N/A'}
                            </span>
                            {showWarning && (
                                <span title="No measurements — stitching will be blocked" className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded text-[9px] font-bold text-amber-500 uppercase">
                                    <Ruler size={9} /> No Msmt
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                            <User size={11} className="opacity-60 shrink-0" />
                            <span className="truncate">
                                {item.order?.customer?.display_name ||
                                    (item.order?.customer?.first_name
                                        ? `${item.order.customer.first_name} ${item.order.customer.last_name || ''}`
                                        : 'No Customer')}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Item',
            key: 'item_name',
            className: 'w-[11%]',
            accessor: (item) => (
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: item.order?.priority?.color || '#94a3b8' }}
                        title={item.order?.priority?.name}
                    />
                    <span className="text-sm font-medium text-text-secondary truncate">
                        {item.item_name || item.item_type?.name || 'Unknown Item'}
                    </span>
                </div>
            )
        },
        {
            header: 'Responsibility',
            key: 'worker_id',
            className: 'w-[17%]',
            accessor: (item) => {
                const isAssigned = !!(item.assigned_worker || item.assigned_user);
                const name = item.assigned_worker
                    ? (item.assigned_worker.display_name || `${item.assigned_worker.first_name} ${item.assigned_worker.last_name || ''}`)
                    : (item.assigned_user?.name || 'Waiting...');

                return (
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border shrink-0
                            ${isAssigned
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-text-muted/5 text-text-muted/30 border-border/40'}`}>
                            {isAssigned ? name[0]?.toUpperCase() : '?'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-black uppercase tracking-tight ${isAssigned ? 'text-primary' : 'text-text-muted'}`}>
                                {isAssigned ? 'Assigned' : 'Unassigned'}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted truncate leading-none mt-0.5">
                                {item.assigned_worker ? `${name}` :
                                    item.assigned_user ? `${name}` : 'Not Allocated'}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Workflow Progress',
            className: 'w-[27%]',
            accessor: (item) => (
                <ProgressRibbon
                    stages={allStages}
                    tasks={item.workflow_tasks || []}
                    currentStageId={item.current_workflow_stage_id}
                    completedStageIds={item.workflow_tasks?.filter(t => t.status === 'completed').map(t => t.workflow_stage_id) || []}
                    skippedStageIds={item.workflow_tasks?.filter(t => t.status === 'skipped').map(t => t.workflow_stage_id) || []}
                    overdueStageIds={[]}
                />
            )
        },
        {
            header: 'Delivery',
            key: 'promised_delivery_date',
            className: 'w-[13%]',
            accessor: (item) => {
                const isOverdue = item.order?.promised_delivery_date
                    && new Date(item.order.promised_delivery_date) < new Date()
                    && item.status !== 'completed';
                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                            <Calendar size={12} className="text-text-muted shrink-0" />
                            <span>
                                {item.order?.promised_delivery_date
                                    ? new Date(item.order.promised_delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                    : '—'}
                            </span>
                        </div>
                        {isOverdue && (
                            <span className="text-[9px] font-bold text-error bg-error/10 px-1.5 py-0.5 rounded-full w-fit">
                                OVERDUE
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Production Status',
            key: 'status',
            className: 'w-[18%]',
            accessor: (item) => {
                const stageName = item.current_workflow_stage?.name || 'Production';
                const status = item.status || 'pending';
                const statusColors = {
                    completed:   'bg-success/10 text-success border-success/20',
                    in_progress: 'bg-primary/10 text-primary border-primary/20',
                    pending:     'bg-warning/10 text-warning border-warning/20',
                };
                const statusLabel = {
                    completed:   'Delivered',
                    in_progress: 'In Progress',
                    pending:     'Pending',
                };

                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border w-fit whitespace-nowrap ${statusColors[status] || ''}`}>
                            {status === 'completed' ? 'Delivered' : stageName}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-0.5">
                            {statusLabel[status] || status.replace('_', ' ')}
                        </span>
                    </div>
                );
            }
        }
    ];

    // Priority filter pills for the footer
    const footerContent = priorities.length > 0 ? (
        <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mr-1">Priority:</span>
            {priorities.map(p => {
                const isActive = String(activePriorityId) === String(p.id);
                return (
                    <button
                        key={p.id}
                        onClick={() => onPriorityFilter?.(isActive ? '' : p.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            isActive
                                ? 'text-white border-transparent shadow-sm'
                                : 'bg-surface border-border text-text-muted hover:border-current hover:text-text-main'
                        }`}
                        style={isActive ? { backgroundColor: p.color, borderColor: p.color } : { '--tw-text-color': p.color }}
                        title={`Filter by ${p.name} priority`}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: isActive ? 'white' : p.color }}
                        />
                        {p.name}
                    </button>
                );
            })}
        </div>
    ) : null;

    const renderRow = (item) => (
        <tr
            key={item.id}
            onClick={() => onTaskClick(item)}
            className="hover:bg-background-content/30 transition-colors group cursor-pointer text-sm"
        >
            {columns.map((col, index) => (
                <td key={index} className="px-4 py-3 align-middle overflow-hidden">
                    {col.accessor(item)}
                </td>
            ))}
        </tr>
    );

    return (
        <DataTable
            title={title}
            icon={icon}
            headerAction={headerAction}
            columns={columns}
            data={data}
            loading={loading}
            meta={pagination}
            onPageChange={onPageChange}
            renderRow={renderRow}
            emptyMessage="No workflow items found matching your filters."
            filters={filters}
            searchQuery={searchQuery}
            onSearch={onSearch}
            sortConfig={sortConfig}
            onSort={onSort}
            footerContent={footerContent}
        />
    );
};

export default WorkflowListView;
