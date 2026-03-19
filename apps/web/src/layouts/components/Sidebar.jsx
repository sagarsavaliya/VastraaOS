import React, { useState } from 'react';
import {
    Home,
    Users,
    ShoppingBag,
    Settings,
    Palette,
    MessageSquare,
    Activity,
    Briefcase,
    CreditCard,
    BarChart3,
    LayoutDashboard,
    FileText,
    ChevronRight,
    BarChart2,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ── Tenant grouped navigation ─────────────────────────────────────────────────
const tenantGroups = [
    {
        id: 'main',
        label: null, // no label for the top group
        items: [
            { icon: Home, label: 'Dashboard', path: '/' },
        ],
    },
    {
        id: 'operations',
        label: 'Operations',
        items: [
            { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
            { icon: Users, label: 'Customers', path: '/customers' },
            { icon: ShoppingBag, label: 'Orders', path: '/orders' },
            { icon: Activity, label: 'Workflow', path: '/workflow' },
            { icon: Briefcase, label: 'Workers', path: '/workers' },
        ],
    },
    {
        id: 'finance',
        label: 'Finance',
        items: [
            { icon: LayoutDashboard, label: 'Billing', path: '/billing' },
            { icon: FileText, label: 'Invoices', path: '/invoices' },
            { icon: CreditCard, label: 'Payments', path: '/payments' },
            { icon: BarChart2, label: 'Reports', path: '/reports' },
        ],
    },
    {
        id: 'workspace',
        label: 'Workspace',
        items: [
            { icon: Palette, label: 'Theme Builder', path: '/theme-builder' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ],
    },
];

const superAdminGroups = [
    {
        id: 'admin',
        label: null,
        items: [
            { icon: BarChart3, label: 'Platform Stats', path: '/admin/dashboard' },
            { icon: Briefcase, label: 'Tenants', path: '/admin/tenants' },
            { icon: Users, label: 'Admins', path: '/admin/admins' },
            { icon: Settings, label: 'System Config', path: '/admin/settings' },
        ],
    },
];

// ── Single nav item ───────────────────────────────────────────────────────────
const NavItem = ({ item, isOpen }) => (
    <NavLink
        to={item.path}
        end={item.path === '/'}
        title={!isOpen ? item.label : ''}
        className={({ isActive }) => `
            group flex items-center relative h-[44px] rounded-lg
            transition-all duration-200 ease-in-out
            ${isOpen ? 'px-3' : 'px-0 justify-center'}
            ${isActive
                ? 'bg-primary text-white font-medium shadow-md shadow-primary/25'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-main'
            }
        `}
    >
        {({ isActive }) => (
            <>
                <div className={`
                    min-w-[24px] h-[24px] flex items-center justify-center z-[2] shrink-0
                    ${isActive ? 'text-white' : 'text-current'}
                `}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div className={`
                    whitespace-nowrap overflow-hidden
                    transition-[opacity,max-width,transform] duration-300 ease-in-out
                    ${isOpen
                        ? 'opacity-100 ml-3 max-w-[200px] translate-x-0 text-sm'
                        : 'opacity-0 max-w-0 -translate-x-4 absolute'
                    }
                `}>
                    {item.label}
                </div>
            </>
        )}
    </NavLink>
);

// ── Collapsible group ─────────────────────────────────────────────────────────
const NavGroup = ({ group, isOpen, defaultOpen = true }) => {
    const location = useLocation();
    const hasActive = group.items.some(item =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
    );
    const [expanded, setExpanded] = useState(defaultOpen || hasActive);

    // No header for groups without a label
    if (!group.label) {
        return (
            <div className="space-y-1">
                {group.items.map(item => (
                    <NavItem key={item.path} item={item} isOpen={isOpen} />
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Group header — only shown when sidebar is expanded */}
            {isOpen ? (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="w-full flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg group transition-all duration-200 hover:bg-surface-hover"
                >
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] group-hover:text-text-secondary transition-colors">
                        {group.label}
                    </span>
                    <ChevronRight
                        size={12}
                        className={`text-text-muted transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
                    />
                </button>
            ) : (
                /* Collapsed: show a thin divider instead of label */
                <div className="my-2 mx-3 h-px bg-border opacity-60" />
            )}

            {/* Items with expand/collapse animation */}
            <div
                className="space-y-1 overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: expanded || !isOpen ? `${group.items.length * 52}px` : '0px',
                    opacity: expanded || !isOpen ? 1 : 0,
                }}
            >
                {group.items.map(item => (
                    <NavItem key={item.path} item={item} isOpen={isOpen} />
                ))}
            </div>
        </div>
    );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen }) => {
    const { user } = useAuth();
    const groups = user?.is_super_admin ? superAdminGroups : tenantGroups;

    return (
        <aside
            className={`
                fixed left-0 top-topbar-height
                h-[calc(100vh-var(--topbar-height)-var(--footer-height))]
                bg-surface border-r border-border
                z-sidebar overflow-hidden
                transition-[width] duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                ${isOpen ? 'w-sidebar-width' : 'w-sidebar-collapsed-width'}
            `}
        >
            <nav className="flex flex-col gap-3 px-3 py-5 h-full">
                {groups.map((group, i) => (
                    <NavGroup
                        key={group.id}
                        group={group}
                        isOpen={isOpen}
                        defaultOpen={true}
                    />
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
