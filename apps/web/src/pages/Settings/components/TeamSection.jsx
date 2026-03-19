import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pencil, Trash2, UserCheck, UserX, X, ChevronDown, Check, Shield, User, Users } from 'lucide-react';
import { ModernInput, ModernButton } from '../../../components/UI/CustomInputs';
import { useToast } from '../../../components/UI/Toast';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
} from '../services/settingsService';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const getInitials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');

const ROLE_META = {
    owner: {
        label: 'Owner',
        avatarClass: 'bg-primary/10 text-primary',
        badgeClass: 'bg-primary/10 text-primary',
    },
    manager: {
        label: 'Manager',
        avatarClass: 'bg-blue-500/10 text-blue-500',
        badgeClass: 'bg-blue-500/10 text-blue-500',
    },
    staff: {
        label: 'Staff',
        avatarClass: 'bg-surface text-text-secondary border border-border',
        badgeClass: 'bg-surface text-text-secondary border border-border',
    },
};

const EDITABLE_ROLES = [
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
];

/* ─── RoleDropdown ─────────────────────────────────────────────────────────── */

const RoleDropdown = ({ userId, currentRole, onRoleChange }) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = async (role) => {
        if (role === currentRole) { setOpen(false); return; }
        setSaving(true);
        try {
            await onRoleChange(userId, role);
        } finally {
            setSaving(false);
            setOpen(false);
        }
    };

    const meta = ROLE_META[currentRole] ?? ROLE_META.staff;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${meta.badgeClass} hover:opacity-80`}
            >
                {saving ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <ChevronDown size={11} strokeWidth={3} />
                )}
                {meta.label}
            </button>
            {open && (
                <div className="absolute z-[999] top-full mt-1 left-0 bg-surface border border-border rounded-xl shadow-xl overflow-hidden w-36 animate-in fade-in zoom-in-95 duration-150">
                    {EDITABLE_ROLES.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => handleSelect(r.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all ${
                                r.value === currentRole
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:bg-background-content/50 hover:text-text-main'
                            }`}
                        >
                            {r.label}
                            {r.value === currentRole && <Check size={12} strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── UserCard ─────────────────────────────────────────────────────────────── */

const UserCard = ({ user, onEdit, onDelete, onToggleStatus, onRoleChange }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const meta = ROLE_META[user.role] ?? ROLE_META.staff;
    const isOwner = user.role === 'owner';

    return (
        <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-border-hover">
            {/* Avatar */}
            <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${meta.avatarClass}`}
            >
                {getInitials(user.name)}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-main truncate">{user.name}</span>
                    {isOwner ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-primary/10 text-primary">
                            <Shield size={10} />
                            Account Owner
                        </span>
                    ) : (
                        <RoleDropdown
                            userId={user.id}
                            currentRole={user.role}
                            onRoleChange={onRoleChange}
                        />
                    )}
                    <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold ${
                            user.is_active
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                        }`}
                    >
                        {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">{user.email}</p>
                {user.mobile && (
                    <p className="text-xs text-text-muted truncate">{user.mobile}</p>
                )}
            </div>

            {/* Actions */}
            {!isOwner && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {confirmDelete ? (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5">
                            <span className="text-xs text-red-500 font-bold">Remove member?</span>
                            <button
                                type="button"
                                onClick={() => onDelete(user.id)}
                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="text-xs font-bold text-text-muted hover:text-text-main transition-colors"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => onEdit(user)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                title="Edit"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onToggleStatus(user)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                    user.is_active
                                        ? 'text-text-muted hover:text-amber-500 hover:bg-amber-500/10'
                                        : 'text-text-muted hover:text-green-500 hover:bg-green-500/10'
                                }`}
                                title={user.is_active ? 'Deactivate' : 'Activate'}
                            >
                                {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── UserModal ─────────────────────────────────────────────────────────────── */

const EMPTY_FORM = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'staff',
    change_password: false,
};

const UserModal = ({ user, onClose, onSave }) => {
    const isEdit = Boolean(user);
    const [form, setForm] = useState(() =>
        isEdit
            ? { name: user.name, email: user.email, mobile: user.mobile ?? '', role: user.role, password: '', change_password: false }
            : { ...EMPTY_FORM }
    );
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!isEdit && !form.email.trim()) errs.email = 'Email is required';
        if (!isEdit && !form.password.trim()) errs.password = 'Password is required';
        if (isEdit && form.change_password && !form.password.trim()) errs.password = 'New password is required';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        try {
            const payload = { name: form.name, mobile: form.mobile, role: form.role };
            if (!isEdit) {
                payload.email = form.email;
                payload.password = form.password;
            } else if (form.change_password && form.password) {
                payload.password = form.password;
            }
            await onSave(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <User size={16} className="text-primary" />
                        </div>
                        <h2 className="text-base font-bold text-text-main">
                            {isEdit ? 'Edit Team Member' : 'Add Team Member'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-background-content/30 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <ModernInput
                        label="Full Name"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Priya Sharma"
                        error={errors.name}
                    />
                    <ModernInput
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="priya@naarirts.com"
                        disabled={isEdit}
                        error={errors.email}
                    />
                    <ModernInput
                        label="Mobile (optional)"
                        value={form.mobile}
                        onChange={set('mobile')}
                        placeholder="+91 98765 43210"
                    />

                    {/* Role select */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                            Role
                        </label>
                        <select
                            value={form.role}
                            onChange={set('role')}
                            className="h-11 px-4 rounded-xl border border-border bg-background-content/10 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        >
                            {EDITABLE_ROLES.map((r) => (
                                <option key={r.value} value={r.value} className="bg-surface">
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Password field */}
                    {isEdit ? (
                        <div className="space-y-3">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={form.change_password}
                                        onChange={set('change_password')}
                                    />
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                            form.change_password ? 'bg-primary border-primary' : 'border-border'
                                        }`}
                                    >
                                        <Check
                                            size={12}
                                            strokeWidth={4}
                                            className={`text-white transition-all ${form.change_password ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-text-secondary">Change Password</span>
                            </label>
                            {form.change_password && (
                                <ModernInput
                                    label="New Password"
                                    type="password"
                                    value={form.password}
                                    onChange={set('password')}
                                    placeholder="Enter new password"
                                    error={errors.password}
                                />
                            )}
                        </div>
                    ) : (
                        <ModernInput
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={set('password')}
                            placeholder="Minimum 8 characters"
                            error={errors.password}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 border-t border-border">
                    <ModernButton variant="secondary" onClick={onClose}>Cancel</ModernButton>
                    <ModernButton variant="primary" onClick={handleSubmit} loading={saving}>
                        {isEdit ? 'Save Changes' : 'Add Member'}
                    </ModernButton>
                </div>
            </div>
        </div>
    );
};

/* ─── TeamSection ──────────────────────────────────────────────────────────── */

const TeamSection = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalUser, setModalUser] = useState(undefined); // undefined=closed, null=create, obj=edit
    const [actionLoading, setActionLoading] = useState(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getUsers();
            setUsers(data.data ?? data ?? []);
        } catch {
            showToast('Failed to load team members', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleSave = async (payload) => {
        try {
            if (modalUser) {
                await updateUser(modalUser.id, payload);
                showToast('Member updated successfully', 'success');
            } else {
                await createUser(payload);
                showToast('Member added successfully', 'success');
            }
            setModalUser(undefined);
            loadUsers();
        } catch (err) {
            showToast(err?.response?.data?.message ?? 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        setActionLoading(id);
        try {
            await deleteUser(id);
            showToast('Member removed', 'success');
            loadUsers();
        } catch (err) {
            showToast(err?.response?.data?.message ?? 'Failed to delete member', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (user) => {
        setActionLoading(user.id);
        try {
            await updateUserStatus(user.id, !user.is_active);
            showToast(
                user.is_active ? 'Member deactivated' : 'Member activated',
                'success'
            );
            loadUsers();
        } catch (err) {
            showToast(err?.response?.data?.message ?? 'Failed to update status', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await updateUserRole(userId, role);
            showToast('Role updated', 'success');
            loadUsers();
        } catch (err) {
            showToast(err?.response?.data?.message ?? 'Failed to update role', 'error');
        }
    };

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users size={16} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-main">Team Members</h3>
                        <p className="text-xs text-text-muted">
                            {users.length} member{users.length !== 1 ? 's' : ''} in your workspace
                        </p>
                    </div>
                </div>
                <ModernButton
                    variant="primary"
                    size="sm"
                    onClick={() => setModalUser(null)}
                >
                    Add Member
                </ModernButton>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-background-content/20 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-background-content/30 flex items-center justify-center mb-3">
                        <Users size={24} className="text-text-muted" />
                    </div>
                    <p className="text-sm font-bold text-text-muted">No team members yet</p>
                    <p className="text-xs text-text-muted mt-1">Add your first member to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={actionLoading === user.id ? 'opacity-50 pointer-events-none' : ''}
                        >
                            <UserCard
                                user={user}
                                onEdit={(u) => setModalUser(u)}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                                onRoleChange={handleRoleChange}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalUser !== undefined && (
                <UserModal
                    user={modalUser}
                    onClose={() => setModalUser(undefined)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default TeamSection;
