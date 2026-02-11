import React from 'react';
import DataTable from '../../../components/UI/DataTable';
import ProgressRibbon from './ProgressRibbon';
import { User, Calendar, Tag } from 'lucide-react';

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
    onSort
}) => {
    const columns = [
        {
            header: 'Order Details',
            key: 'order_number',
            accessor: (item) => (
                <div className="flex flex-col gap-1 group/item">
                    <span className="text-sm font-bold text-text-main group-hover/item:text-primary transition-colors">
                        #{item.order?.order_number || 'N/A'}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <User size={12} className="opacity-70" />
                        <span>
                            {item.order?.customer?.display_name ||
                                (item.order?.customer?.first_name ? `${item.order.customer.first_name} ${item.order.customer.last_name || ''}` : 'No Customer')}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Item',
            key: 'item_name',
            accessor: (item) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-text-secondary truncate max-w-[150px]">
                        {item.item_name || item.item_type?.name || 'Unknown Item'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                        <div
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{ backgroundColor: item.order?.priority?.color || '#ccc' }}
                        />
                        <span className="text-text-muted capitalize">{item.order?.priority?.name || 'Low'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Responsibility',
            key: 'worker_id',
            accessor: (item) => {
                const isAssigned = !!(item.assigned_worker || item.assigned_user);
                const name = item.assigned_worker
                    ? (item.assigned_worker.display_name || `${item.assigned_worker.first_name} ${item.assigned_worker.last_name || ''}`)
                    : (item.assigned_user?.name || 'Waiting...');

                return (
                    <div className="flex items-center gap-3 group/worker">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border transition-all duration-300
                            ${isAssigned
                                ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                                : 'bg-text-muted/5 text-text-muted/30 border-border/40'}
                        `}>
                            {isAssigned ? name[0] : '?'}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-sm font-black uppercase tracking-tight
                                ${isAssigned ? 'text-primary' : 'text-text-muted'}
                            `}>
                                {isAssigned ? 'Assigned' : 'Unassigned'}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted truncate max-w-[120px] leading-none mt-0.5">
                                {item.assigned_worker ? `Artisan: ${name}` :
                                    item.assigned_user ? `Staff: ${name}` : 'Not Allocated Yet'}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Workflow Progress',
            className: 'min-w-[300px]',
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
            accessor: (item) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                        <Calendar size={14} className="text-text-muted" />
                        <span>
                            {item.order?.promised_delivery_date
                                ? new Date(item.order.promised_delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                : 'No Date'}
                        </span>
                    </div>
                    {item.order?.promised_delivery_date && new Date(item.order.promised_delivery_date) < new Date() && item.status !== 'completed' && (
                        <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                            OVERDUE
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Production Status',
            key: 'status',
            accessor: (item) => {
                const stageName = item.current_workflow_stage?.name || 'Production';
                const status = item.status || 'pending';

                return (
                    <div className="flex flex-col gap-1">
                        <div className={`
                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit
                            ${status === 'completed' ? 'bg-success/10 text-success' : ''}
                            ${status === 'in_progress' ? 'bg-primary/10 text-primary' : ''}
                            ${status === 'pending' ? 'bg-warning/10 text-warning' : ''}
                        `}>
                            {status === 'completed' ? 'Delivered' : stageName}
                        </div>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                            {status.replace('_', ' ')}
                        </span>
                    </div>
                );
            }
        }
    ];

    const renderRow = (item) => (
        <tr
            key={item.id}
            onClick={() => onTaskClick(item)}
            className="hover:bg-background-content/30 transition-colors group cursor-pointer text-sm"
        >
            {columns.map((col, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap">
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
        />
    );
};

export default WorkflowListView;
