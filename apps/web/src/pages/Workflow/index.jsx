import React, { useState, useEffect } from 'react';
import { ListTodo, Clock, AlertTriangle, CheckCircle, Search, Plus } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import StatCard from '../../components/UI/StatCard';
import { getWorkflowList, getPriorities, getWorkers, getWorkflowStages } from './services/workflowService';
import WorkflowListView from './components/WorkflowListView';
import { ModernSelect, ModernCheckbox, ModernInput, ModernButton } from '../../components/UI/CustomInputs';
import TaskDetailsModal from './components/TaskDetailsModal';
import AssignTaskModal from './components/AssignTaskModal';
import PhotoUploadModal from './components/PhotoUploadModal';

const Workflow = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [stages, setStages] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [workers, setWorkers] = useState([]);

    const [filters, setFilters] = useState({
        priority_id: '',
        worker_id: '',
        status: '',
        search: '',
        include_completed: false,
        page: 1,
        sort_by: 'created_at',
        sort_dir: 'desc'
    });

    // Modal states
    const [selectedItem, setSelectedItem] = useState(null);
    const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchMasterData = async () => {
        try {
            const [stagesRes, prioritiesRes, workersRes] = await Promise.all([
                getWorkflowStages(),
                getPriorities(),
                getWorkers()
            ]);
            setStages(stagesRes.data || []);
            setPriorities(prioritiesRes.data || []);
            setWorkers(workersRes.data || []);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getWorkflowList(filters);
            setItems(data.data || []);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                per_page: data.per_page
            });
        } catch (error) {
            console.error('Error fetching workflow list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key, direction) => {
        setFilters(prev => ({
            ...prev,
            sort_by: key,
            sort_dir: direction,
            page: 1
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleTaskClick = (item) => {
        setSelectedItem(item);
        setIsTaskDetailsOpen(true);
    };

    const handleAssignClick = (item) => {
        setSelectedItem(item);
        setIsAssignModalOpen(true);
    };

    const handleAssignSuccess = () => {
        fetchData();
        setIsAssignModalOpen(false);
        setSelectedItem(null);
    };

    const filterUI = (
        <>
            <ModernSelect
                size="sm"
                placeholder="All Priorities"
                value={filters.priority_id}
                options={priorities}
                onChange={(e) => setFilters({ ...filters, priority_id: e.target.value, page: 1 })}
                className="min-w-[140px]"
            />
            <ModernSelect
                size="sm"
                placeholder="All Workers"
                value={filters.worker_id}
                options={workers.map(w => ({ id: w.id, name: w.display_name || w.name }))}
                onChange={(e) => setFilters({ ...filters, worker_id: e.target.value, page: 1 })}
                className="min-w-[140px]"
            />
            <ModernCheckbox
                label="Completed"
                checked={filters.include_completed}
                onChange={(e) => setFilters({ ...filters, include_completed: e.target.checked, page: 1 })}
                className="h-9"
            />
        </>
    );

    const kpiCards = [
        {
            title: 'Active Workflow Items',
            value: pagination.total || 0,
            icon: ListTodo,
            color: 'primary'
        },
        {
            title: 'My Assignments',
            value: 0,
            icon: Clock,
            color: 'info'
        },
        {
            title: 'Critical/Overdue',
            value: 0,
            icon: AlertTriangle,
            color: 'error'
        },
        {
            title: 'Units Completed',
            value: 0,
            icon: CheckCircle,
            color: 'success'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>

            <WorkflowListView
                title="Production Workflow"
                icon={ListTodo}
                headerAction={() => (
                    <ModernButton
                        onClick={() => {
                            setSelectedItem(null);
                            setIsAssignModalOpen(true);
                        }}
                        icon={Plus}
                        variant="primary"
                        size="sm"
                    >
                        NEW ASSIGNMENT
                    </ModernButton>
                )}
                data={items}
                loading={loading}
                onTaskClick={handleTaskClick}
                pagination={pagination}
                onPageChange={handlePageChange}
                allStages={stages}
                filters={filterUI}
                searchQuery={filters.search}
                onSearch={(val) => setFilters({ ...filters, search: val, page: 1 })}
                sortConfig={{ key: filters.sort_by, direction: filters.sort_dir }}
                onSort={handleSort}
            />

            {/* Modals */}
            <TaskDetailsModal
                isOpen={isTaskDetailsOpen}
                onClose={() => setIsTaskDetailsOpen(false)}
                taskId={selectedItem?.id}
                onAssignClick={(item) => {
                    setIsTaskDetailsOpen(false);
                    setSelectedItem(item);
                    setIsAssignModalOpen(true);
                }}
                onPhotoUploadClick={(item) => {
                    setSelectedItem(item);
                    setIsPhotoUploadOpen(true);
                }}
                onStatusUpdate={fetchData}
            />

            <AssignTaskModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                task={selectedItem}
                onSuccess={handleAssignSuccess}
            />

            <PhotoUploadModal
                isOpen={isPhotoUploadOpen}
                onClose={() => setIsPhotoUploadOpen(false)}
                task={selectedItem}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default Workflow;
