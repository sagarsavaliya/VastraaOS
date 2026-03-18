import React from 'react';

/*
 * Fabric weave texture — two overlapping diagonal linear-gradients at 45° and -45°
 * simulate the warp and weft of woven textile (like georgette or dupatta fabric).
 * Each gradient draws a single 1px line per 24px tile at ~4% opacity.
 * rgba(255,255,255,...) works in dark mode (faint warm lattice over deep charcoal).
 * rgba(0,0,0,...) works in light mode (faint warm shadow weave over cream linen).
 * Both layers together create a subtle diamond/crosshatch that reads as texture,
 * not as a UI grid — keeping the fashion-house aesthetic without competing with content.
 */
const fabricWeaveStyle = {
    backgroundImage: [
        // Warp threads — 45° diagonal, white, ~4% opacity
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 24px)',
        // Weft threads — -45° diagonal, white, ~4% opacity
        'repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 24px)',
        // Subtle dark layer for light mode contrast — same pattern, low-opacity dark
        'repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 24px)',
        'repeating-linear-gradient(-45deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 24px)',
    ].join(', '),
};

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
            style={fabricWeaveStyle}
        >
            <div className="max-w-full mx-auto">
                {children}
            </div>
        </main>
    );
};

export default Content;
