import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, User, Briefcase, Zap, Package } from 'lucide-react';
import { assignTask, getWorkers, getUsers, getWorkflowList } from '../services/workflowService';
import { useToast } from '../../../components/UI/Toast';
import { ModernSelect, ModernInput, ModernButton, ModernSearchSelect } from '../../../components/UI/CustomInputs';
import Modal from '../../../components/UI/Modal';

const AssignTaskModal = ({ isOpen, onClose, task, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        worker_id: '',
        user_id: '',
        assignee_type: 'worker',
        item_id: '',
        due_date: new Date().toISOString().split('T')[0]
    });

    const selectedItemData = items.find(i => i.id === formData.item_id);

    // Pre-fill and Fetch Data
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setInitialLoading(true);
                try {
                    const [workersRes, usersRes, itemsRes] = await Promise.all([
                        getWorkers(),
                        getUsers(),
                        !task ? getWorkflowList({ per_page: 100 }) : Promise.resolve({ data: [] })
                    ]);

                    setWorkers(workersRes.data || []);
                    setUsers(usersRes.data || []);
                    setItems(itemsRes.data || []);

                    if (task) {
                        // If task is an OrderItem, find the active workflow task
                        const activeTask = task.workflow_tasks?.find(t => t.status !== 'completed') || task.workflow_tasks?.[0];

                        setFormData(prev => ({
                            ...prev,
                            worker_id: task.assigned_worker_id || '',
                            user_id: task.assigned_user_id || '',
                            assignee_type: task.assigned_user_id ? 'user' : 'worker',
                            item_id: task.id,
                            due_date: activeTask?.due_date ? new Date(activeTask.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        }));
                    } else {
                        setFormData({ worker_id: '', user_id: '', assignee_type: 'worker', item_id: '', due_date: new Date().toISOString().split('T')[0] });
                    }
                } catch (err) {
                    console.error('Error fetching assignment data:', err);
                    showToast('Failed to load team data', 'error');
                } finally {
                    setInitialLoading(false);
                }
            };

            fetchData();
        }
    }, [isOpen, task]);

    const handleAssign = async () => {
        const selectedId = formData.assignee_type === 'user' ? formData.user_id : formData.worker_id;

        if (!selectedId) {
            showToast(`Please select a ${formData.assignee_type === 'user' ? 'team member' : 'artisan'}`, 'error');
            return;
        }

        const targetId = !task
            ? (selectedItemData?.workflow_tasks?.find(t => t.status !== 'completed')?.id ||
                selectedItemData?.workflow_tasks?.[0]?.id)
            : (task.workflow_tasks?.find(t => t.status !== 'completed')?.id || task.workflow_tasks?.[0]?.id);

        if (!targetId) {
            showToast('No active workflow task found for this item', 'error');
            console.error('Task assignment failed: targetId is undefined', { task, selectedItemData, formData });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                user_id: formData.assignee_type === 'user' ? formData.user_id : null,
                worker_id: formData.assignee_type === 'worker' ? formData.worker_id : null,
            };

            await assignTask(targetId, payload);
            showToast('Production assigned successfully', 'success');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error('Error assigning task:', error);
            showToast(error.response?.data?.message || 'Failed to assign production', 'error');
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div className="flex items-center gap-4 w-full">
            <ModernButton
                variant="secondary"
                onClick={onClose}
                className="flex-1 !rounded-xl"
            >
                CANCEL
            </ModernButton>
            <ModernButton
                onClick={handleAssign}
                loading={loading}
                disabled={(!formData.worker_id && !formData.user_id) || (!task && !formData.item_id)}
                variant="primary"
                icon={Zap}
            >
                {task ? 'UPDATE ASSIGNMENT' : 'INITIATE ASSIGNMENT'}
            </ModernButton>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task ? 'Re-assign Workflow' : 'New Assignment'}
            footer={footer}
            size="md"
        >
            <div className="space-y-8">
                {initialLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Syncing Team...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Item Info / Selection */}
                        <div className="bg-background-content/50 rounded-xl p-5 border border-border">
                            {!task ? (
                                <ModernSearchSelect
                                    label="Select Production Item"
                                    value={formData.item_id}
                                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                                    options={items.map(i => ({
                                        id: i.id,
                                        label: `#${i.order?.order_number} - ${i.item_type?.name || i.item_name}`,
                                        sublabel: i.order?.customer?.display_name
                                    }))}
                                    placeholder="Search by order or item..."
                                    icon={Package}
                                />
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Current Production</p>
                                    <p className="text-sm font-bold text-text-main flex items-center gap-2">
                                        <Package size={16} className="text-primary" />
                                        #{task.order?.order_number || 'N/A'} - {task.item_type?.name || task.item_name || 'Item'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Allocation Section */}
                        <div className="bg-background-content/50 rounded-xl p-6 border border-border space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full border border-border bg-primary/10 text-primary">
                                    <UserPlus size={18} />
                                </div>
                                <h4 className="text-sm font-bold text-text-main uppercase tracking-tight">Assign Responsibility</h4>
                            </div>

                            <div className="space-y-5">
                                <ModernSelect
                                    label="Internal Lead (Staff)"
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value, worker_id: '', assignee_type: 'user' })}
                                    options={users.map(u => ({ id: u.id, name: u.name }))}
                                    placeholder="Select team member..."
                                    icon={User}
                                />

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                        <span className="bg-surface px-4">OR</span>
                                    </div>
                                </div>

                                <ModernSelect
                                    label="External Artisan (Worker)"
                                    value={formData.worker_id}
                                    onChange={(e) => setFormData({ ...formData, worker_id: e.target.value, user_id: '', assignee_type: 'worker' })}
                                    options={workers.map(w => ({ id: w.id, name: w.display_name || w.name }))}
                                    placeholder="Select artisan..."
                                    icon={Briefcase}
                                />
                            </div>
                        </div>

                        {/* Deadline Section */}
                        <div className="bg-background-content/50 rounded-xl p-6 border border-border">
                            <ModernInput
                                type="date"
                                label="Commitment Deadline"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                icon={Calendar}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AssignTaskModal;
