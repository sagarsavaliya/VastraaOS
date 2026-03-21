import React, { useState, useEffect, useCallback } from 'react';
import { Users, User, Phone, MapPin, Briefcase, Award, Trash2, Edit, Plus, Activity, Clock, Mail, IndianRupee, Calendar, Landmark, CreditCard, AtSign, Notebook, ShieldCheck, Hexagon } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import StatCard from '../../components/UI/StatCard';
import Modal from '../../components/UI/Modal';
import WorkerForm from './components/WorkerForm';
import { getWorkers, getWorkerStats, deleteWorker, getWorkerAssignments } from './services/workerService';
import { ModernButton } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';

// Worker avatar — square with rounded corners, no oval
const WorkerAvatar = ({ name, size = 'md' }) => {
    const initials = name
        ? name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
        : '?';
    const sizes = {
        sm: 'w-9 h-9 text-sm rounded-xl',
        md: 'w-10 h-10 text-sm rounded-xl',
        lg: 'w-16 h-16 text-xl rounded-2xl',
    };
    return (
        <div className={`${sizes[size]} bg-primary/15 text-primary font-black flex items-center justify-center shrink-0 border border-primary/20`}>
            {initials}
        </div>
    );
};

// Reusable info cell
const InfoCell = ({ icon: Icon, label, value }) => (
    <div className="bg-background-content/30 border border-border rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-1">
            <Icon size={11} className="text-text-muted" />
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-xs font-semibold text-text-main break-all">{value || '—'}</p>
    </div>
);

// Section header — mirrors WorkerForm sections
const SectionHeader = ({ icon: Icon, label, color = 'primary' }) => {
    const colors = {
        primary: 'bg-primary/10 text-primary',
        amber: 'bg-amber-500/10 text-amber-500',
        indigo: 'bg-indigo-500/10 text-indigo-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        slate: 'bg-slate-500/10 text-slate-400',
    };
    return (
        <div className="flex items-center gap-3 border-b border-border pb-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
                <Icon size={15} strokeWidth={2.5} />
            </div>
            <h3 className="text-xs font-black text-text-main uppercase tracking-widest">{label}</h3>
        </div>
    );
};

const PROFICIENCY_BADGE = {
    beginner:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    expert:       'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const RATE_TYPE_LABEL = {
    per_piece: 'Per Piece',
    per_hour:  'Per Hour',
    per_day:   'Per Day',
    fixed:     'Fixed Salary',
};

// Worker View Modal
const WorkerViewModal = ({ worker, isOpen, onClose, onEdit }) => {
    const [assignments, setAssignments] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        if (isOpen && worker?.id) {
            setAssignLoading(true);
            getWorkerAssignments(worker.id)
                .then(res => setAssignments(res.data || []))
                .catch(() => setAssignments([]))
                .finally(() => setAssignLoading(false));
        }
    }, [isOpen, worker?.id]);

    if (!worker) return null;

    const hasBank = worker.bank_name || worker.bank_account_number || worker.bank_ifsc_code || worker.upi_id;
    const fullAddress = [worker.address, worker.city, worker.state, worker.pincode].filter(Boolean).join(', ');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Worker Profile" size="xl">
            <div className="space-y-6">

                {/* ── Hero header ── */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-4">
                        <WorkerAvatar name={worker.display_name} size="lg" />
                        <div>
                            <h2 className="text-xl font-black text-text-main leading-tight">{worker.display_name}</h2>
                            {(worker.first_name || worker.last_name) && worker.display_name !== `${worker.first_name} ${worker.last_name}`.trim() && (
                                <p className="text-xs text-text-muted mt-0.5">{worker.first_name} {worker.last_name}</p>
                            )}
                            <div className="flex items-center flex-wrap gap-2 mt-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest border border-border px-2 py-0.5 rounded-lg">
                                    {worker.worker_code}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-lg ${
                                    worker.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }`}>
                                    {worker.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {worker.worker_type && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest border border-border bg-background-content/30 px-2 py-0.5 rounded-lg text-text-muted">
                                        {worker.worker_type === 'external' ? 'External / Jobwork' : 'In-House Staff'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <ModernButton variant="secondary" size="sm" icon={Edit} onClick={() => { onClose(); onEdit(worker); }}>
                        Edit
                    </ModernButton>
                </div>

                {/* ── Section 1: Personal Profile ── */}
                <div className="space-y-3">
                    <SectionHeader icon={User} label="Personal Profile" color="primary" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <InfoCell icon={Phone}     label="Mobile"           value={worker.mobile} />
                        <InfoCell icon={Phone}     label="Alternate Mobile" value={worker.alternate_mobile} />
                        <InfoCell icon={Mail}      label="Email"            value={worker.email} />
                        <InfoCell icon={MapPin}    label="Address"          value={fullAddress || worker.city} />
                        <InfoCell icon={MapPin}    label="State"            value={worker.state} />
                        <InfoCell icon={MapPin}    label="Pincode"          value={worker.pincode} />
                    </div>
                </div>

                {/* ── Section 2: Technical & Payment ── */}
                <div className="space-y-3">
                    <SectionHeader icon={Award} label="Technical & Payment" color="amber" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <InfoCell icon={Briefcase}   label="Specialization"  value={worker.specialization} />
                        <InfoCell icon={Calendar}    label="Experience"      value={worker.experience_years ? `${worker.experience_years} years` : null} />
                        <InfoCell icon={CreditCard}  label="Rate Type"       value={RATE_TYPE_LABEL[worker.rate_type] || worker.rate_type} />
                        <InfoCell icon={IndianRupee} label="Default Rate"    value={worker.default_rate ? `₹${parseFloat(worker.default_rate).toLocaleString('en-IN')}` : null} />
                        <InfoCell icon={ShieldCheck} label="PAN Number"      value={worker.pan_number} />
                    </div>
                </div>

                {/* ── Section 3: Bank Details ── */}
                {hasBank && (
                    <div className="space-y-3">
                        <SectionHeader icon={Landmark} label="Bank Details" color="indigo" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <InfoCell icon={User}      label="Account Name"   value={worker.bank_account_name} />
                            <InfoCell icon={CreditCard} label="Account Number" value={worker.bank_account_number} />
                            <InfoCell icon={Landmark}  label="Bank Name"      value={worker.bank_name} />
                            <InfoCell icon={Hexagon}   label="IFSC Code"      value={worker.bank_ifsc_code} />
                            <InfoCell icon={AtSign}    label="UPI ID"         value={worker.upi_id} />
                        </div>
                    </div>
                )}

                {/* ── Section 4: Skills Matrix ── */}
                <div className="space-y-3">
                    <SectionHeader icon={Plus} label="Skills Matrix" color="emerald" />
                    {worker.skills?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {worker.skills.map((skill, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-background border border-border rounded-xl">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                        <span className="text-xs font-bold text-text-main truncate">{skill.work_type?.name || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${PROFICIENCY_BADGE[skill.proficiency_level] || PROFICIENCY_BADGE.intermediate}`}>
                                            {skill.proficiency_level || 'intermediate'}
                                        </span>
                                        {skill.rate_per_piece > 0 && (
                                            <span className="text-[10px] font-bold text-text-muted">
                                                ₹{parseFloat(skill.rate_per_piece).toLocaleString('en-IN')}/pc
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-text-muted italic text-center py-3">No skills listed</p>
                    )}
                </div>

                {/* ── Section 5: Notes ── */}
                {worker.notes && (
                    <div className="space-y-3">
                        <SectionHeader icon={Notebook} label="Internal Notes" color="slate" />
                        <div className="bg-background-content/30 border border-border rounded-xl px-4 py-3">
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{worker.notes}</p>
                        </div>
                    </div>
                )}

                {/* ── Section 6: Recent Assignments ── */}
                <div className="space-y-3">
                    <SectionHeader icon={Activity} label="Recent Assignments" color="primary" />
                    {assignLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-background-content/30 rounded-xl animate-pulse" />)}
                        </div>
                    ) : assignments.length === 0 ? (
                        <p className="text-xs text-text-muted italic text-center py-4">No assignments yet</p>
                    ) : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto">
                            {assignments.slice(0, 15).map((a, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-background border border-border rounded-xl text-xs">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                        a.status === 'completed' ? 'bg-emerald-500' :
                                        a.status === 'in_progress' ? 'bg-primary' : 'bg-amber-500'
                                    }`} />
                                    <span className="flex-1 font-medium text-text-main truncate">
                                        {a.order?.order_number ? `#${a.order.order_number}` : '—'} — {a.workflow_stage?.name || a.item_name || 'Task'}
                                    </span>
                                    <span className="text-[10px] text-text-muted font-bold uppercase shrink-0">
                                        {a.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </Modal>
    );
};

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
    const [viewWorker, setViewWorker] = useState(null);

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
            const data = await getWorkers({ page, search, per_page: limit, sort_by: sort?.key, sort_dir: sort?.direction });
            setWorkers(data.data || []);
            setMeta(data.meta || {});
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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
        if (!window.confirm('Are you sure you want to delete this worker? This action cannot be undone.')) return;
        try {
            await deleteWorker(id);
            showToast('Worker deleted successfully', 'success');
            fetchData();
        } catch (error) {
            showToast('Failed to delete worker', 'error');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) { setCurrentPage(1); fetchWorkers(1, searchQuery, perPage, sortConfig); }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        const newSort = { key, direction };
        setSortConfig(newSort);
        setCurrentPage(1);
        fetchWorkers(1, searchQuery, perPage, newSort);
    };

    const columns = [
        { header: 'Worker', key: 'display_name', className: 'w-[28%]' },
        { header: 'Contact', key: 'mobile', className: 'w-[20%]' },
        { header: 'Skills', className: 'w-[22%]' },
        { header: 'Daily Rate', key: 'default_rate', className: 'w-[13%]' },
        { header: 'Status', key: 'is_active', className: 'w-[10%]' },
        { header: '', className: 'w-[7%]' },
    ];

    const renderRow = (worker) => (
        <tr
            key={worker.id}
            onClick={() => setViewWorker(worker)}
            className="hover:bg-background-content/30 transition-colors group cursor-pointer text-sm"
        >
            <td className="px-4 py-3 overflow-hidden">
                <div className="flex items-center gap-3">
                    <WorkerAvatar name={worker.display_name} size="md" />
                    <div className="min-w-0">
                        <span className="text-sm font-bold text-text-main group-hover:text-primary transition-colors block truncate">
                            {worker.display_name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                            <span className="border border-border px-1.5 py-0.5 rounded font-bold uppercase">{worker.worker_code}</span>
                            {worker.city && <><span className="opacity-30">·</span><span>{worker.city}</span></>}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 overflow-hidden">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Phone size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">{worker.mobile}</span>
                    </div>
                    {worker.email && (
                        <span className="text-[10px] text-text-muted truncate">{worker.email}</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 overflow-hidden">
                <div className="flex flex-wrap gap-1">
                    {worker.skills?.slice(0, 2).map(skill => (
                        <span key={skill.id} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg uppercase">
                            {skill.work_type?.name}
                        </span>
                    ))}
                    {worker.skills?.length > 2 && (
                        <span className="px-2 py-0.5 border border-dashed border-border text-[10px] font-bold rounded-lg text-text-muted">
                            +{worker.skills.length - 2}
                        </span>
                    )}
                    {(!worker.skills || worker.skills.length === 0) && (
                        <span className="text-xs text-text-muted italic">—</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm font-bold text-text-main">
                    ₹{parseFloat(worker.default_rate || 0).toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-text-muted uppercase font-semibold">per day</span>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg border ${
                    worker.is_active
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                    {worker.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1 justify-end">
                    <button
                        onClick={e => { e.stopPropagation(); handleEdit(worker); }}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); handleDelete(worker.id); }}
                        className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Workers" value={stats?.total || 0} subtitle="Registered staff" icon={Briefcase} loading={loading} />
                <StatCard title="Active Now" value={stats?.active || 0} subtitle="Currently available" icon={User} loading={loading} color="success" />
                <StatCard title="Active Tasks" value={stats?.with_pending_tasks || 0} subtitle="Assignments in play" icon={Activity} loading={loading} color="info" />
                <StatCard title="Work Orders" value={stats?.with_pending_embellishments || 0} subtitle="Processing units" icon={Clock} loading={loading} color="warning" />
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
                onPageChange={page => { setCurrentPage(page); fetchWorkers(page, searchQuery, perPage, sortConfig); }}
                onLimitChange={limit => { setPerPage(limit); setCurrentPage(1); fetchWorkers(1, searchQuery, limit, sortConfig); }}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No workers found matching your search"
                searchPlaceholder="Search by name, code, contact or skill..."
                sortConfig={sortConfig}
                onSort={handleSort}
                headerAction={() => (
                    <ModernButton onClick={() => setIsCreateModalOpen(true)} icon={Plus} variant="primary" size="sm">
                        ADD NEW WORKER
                    </ModernButton>
                )}
            />

            {/* View Modal */}
            <WorkerViewModal
                worker={viewWorker}
                isOpen={!!viewWorker}
                onClose={() => setViewWorker(null)}
                onEdit={handleEdit}
            />

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCancel}
                title={selectedWorker ? 'Edit Worker Profile' : 'Add New Worker'}
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
