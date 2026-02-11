import React, { useState, useEffect, useCallback } from 'react';
import { Users, User, Phone, MapPin, Briefcase, Award, Search, Trash2, Edit, Plus, Activity, Clock } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import StatCard from '../../components/UI/StatCard';
import Modal from '../../components/UI/Modal';
import WorkerForm from './components/WorkerForm';
import { getWorkers, getWorkerStats, deleteWorker } from './services/workerService';
import { ModernButton } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';

const Workers = () => {
    const { showToast } = useToast();
    const [workers, setWorkers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'display_name', direction: 'asc' });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [modalFooter, setModalFooter] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsData = await getWorkerStats();
            setStats(statsData);
            await fetchWorkers(currentPage, searchQuery, perPage, sortConfig);
        } catch (error) {
            console.error('Error fetching workers data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkers = async (page, search, limit, sort) => {
        setTableLoading(true);
        try {
            const data = await getWorkers({
                page,
                search,
                per_page: limit,
                sort_by: sort?.key,
                sort_dir: sort?.direction
            });
            setWorkers(data.data || []);
            setMeta(data.meta || {});
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSuccess = useCallback(() => {
        setIsCreateModalOpen(false);
        setSelectedWorker(null);
        setModalFooter(null);
        fetchData();
    }, [currentPage, searchQuery, perPage, sortConfig]);

    const handleCancel = useCallback(() => {
        setIsCreateModalOpen(false);
        setSelectedWorker(null);
        setModalFooter(null);
    }, []);

    const handleEdit = (worker) => {
        setSelectedWorker(worker);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this worker? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteWorker(id);
            showToast('Worker deleted successfully', 'success');
            fetchData();
        } catch (error) {
            console.error('Error deleting worker:', error);
            showToast('Failed to delete worker', 'error');
        }
    };

    // Handle Search with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                setCurrentPage(1);
                fetchWorkers(1, searchQuery, perPage, sortConfig);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        const newSort = { key, direction };
        setSortConfig(newSort);
        setCurrentPage(1);
        fetchWorkers(1, searchQuery, perPage, newSort);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchWorkers(newPage, searchQuery, perPage, sortConfig);
    };

    const handleLimitChange = (newLimit) => {
        setPerPage(newLimit);
        setCurrentPage(1);
        fetchWorkers(1, searchQuery, newLimit, sortConfig);
    };

    const columns = [
        { header: 'Worker', key: 'display_name' },
        { header: 'Contact', key: 'mobile' },
        { header: 'Skills', key: 'skills' },
        { header: 'Daily Rate', key: 'default_rate' },
        { header: 'Status', key: 'is_active' },
        { header: 'Actions', className: 'text-right' }
    ];

    const getStatusStyle = (isActive) => {
        return isActive
            ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const renderRow = (worker) => (
        <tr key={worker.id} className="hover:bg-background-content/30 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20">
                        {worker.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                            {worker.display_name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5 font-medium">
                            <span className="border border-border px-1.5 py-0.5 rounded text-[10px] uppercase">{worker.worker_code}</span>
                            <span className="text-slate-300">|</span>
                            {worker.city || 'Location N/A'}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-text-muted" />
                        {worker.mobile}
                    </div>
                    {worker.email && (
                        <div className="text-xs text-text-muted mt-1 font-medium lowercase italic">
                            {worker.email}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {worker.skills?.slice(0, 2).map((skill) => (
                        <span key={skill.id} className="px-2 py-0.5 border border-content text-[10px] font-bold rounded uppercase">
                            {skill.work_type?.name}
                        </span>
                    ))}
                    {worker.skills?.length > 2 && (
                        <span className="px-2 py-0.5 border border-content text-[10px] font-bold rounded border border-dashed">
                            +{worker.skills.length - 2} MORE
                        </span>
                    )}
                    {(!worker.skills || worker.skills.length === 0) && (
                        <span className="text-xs text-text-muted italic">No skills listed</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main">
                        ₹{parseFloat(worker.default_rate || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-text-muted uppercase font-semibold">per day</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md border shadow-sm ${getStatusStyle(worker.is_active)}`}>
                    {worker.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2 text-text-muted">
                    <button
                        className="p-2 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                        title="Assignments"
                    >
                        <Activity size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(worker)}
                        className="p-2 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border border-transparent hover:border-amber-200 shadow-sm hover:shadow-md"
                        title="Edit Profile"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(worker.id)}
                        className="p-2 hover:text-error hover:bg-error/10 rounded-lg transition-colors border border-transparent hover:border-error/20 shadow-sm hover:shadow-md"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Workers"
                    value={stats?.total || 0}
                    subtitle="Registered staff"
                    icon={Briefcase}
                    loading={loading}
                />
                <StatCard
                    title="Active Now"
                    value={stats?.active || 0}
                    subtitle="Currently available"
                    icon={User}
                    loading={loading}
                    color="success"
                />
                <StatCard
                    title="Active Tasks"
                    value={stats?.with_pending_tasks || 0}
                    subtitle="Assignments in play"
                    icon={Activity}
                    loading={loading}
                    color="info"
                />
                <StatCard
                    title="Work Orders"
                    value={stats?.with_pending_embellishments || 0}
                    subtitle="Processing units"
                    icon={Clock}
                    loading={loading}
                    color="warning"
                />
            </div>

            <DataTable
                title="Workers Directory"
                icon={Briefcase}
                columns={columns}
                data={workers}
                loading={tableLoading || loading}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                meta={meta}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No workers found matching your search"
                searchPlaceholder="Search by name, code, contact or skill..."
                sortConfig={sortConfig}
                onSort={handleSort}
                headerAction={() => (
                    <ModernButton
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={Plus}
                        variant="primary"
                        size="sm"
                    >
                        ADD NEW WORKER
                    </ModernButton>
                )}
            />

            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCancel}
                title={selectedWorker ? "Edit Worker Profile" : "Add New Worker"}
                footer={modalFooter}
                size="lg"
            >
                <WorkerForm
                    worker={selectedWorker}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    setFooter={setModalFooter}
                />
            </Modal>
        </div>
    );
};

export default Workers;
