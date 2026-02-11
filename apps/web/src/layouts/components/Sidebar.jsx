import React from 'react';
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
    BarChart3
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Activity, label: 'Workflow', path: '/workflow' },
    { icon: Briefcase, label: 'Workers', path: '/workers' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Palette, label: 'Theme Builder', path: '/theme-builder' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = ({ isOpen }) => {
    return (
        <aside
            className={`
                fixed left-0 top-topbar-height 
                h-[calc(100vh-var(--topbar-height)-var(--footer-height))]
                bg-surface border-r border-border
                z-sidebar overflow-y-auto overflow-x-hidden
                transition-[width,box-shadow] duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                ${isOpen ? 'w-sidebar-width' : 'w-sidebar-collapsed-width'}
            `}
        >
            <nav className="flex flex-col gap-2 px-3 py-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={!isOpen ? item.label : ''}
                        className={({ isActive }) => `
                            group flex items-center relative overflow-hidden h-[44px]
                            transition-all duration-200 ease-in-out
                            rounded-lg
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
                                    transition-colors duration-200
                                    ${isActive ? 'text-white' : 'text-current'}
                                `}>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>

                                <div
                                    className={`
                                        whitespace-nowrap overflow-hidden
                                        transition-[opacity,max-width,transform] duration-300 ease-in-out
                                        ${isOpen
                                            ? 'opacity-100 ml-3 max-w-[200px] translate-x-0'
                                            : 'opacity-0 max-w-0 -translate-x-4 absolute'
                                        }
                                    `}
                                >
                                    {item.label}
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
