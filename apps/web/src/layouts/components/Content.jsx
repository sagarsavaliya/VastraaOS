import React from 'react';

const Content = ({ children, isSidebarOpen }) => {
    return (
        <main
            className={`
                fixed top-topbar-height bottom-footer-height right-0
                p-8 overflow-y-auto z-[1]
                bg-background-content text-text-main
                transition-[left] duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                ${isSidebarOpen ? 'left-sidebar-width' : 'left-sidebar-collapsed-width'}
            `}
        >
            <div className="max-w-full mx-auto">
                {children}
            </div>
        </main>
    );
};

export default Content;
