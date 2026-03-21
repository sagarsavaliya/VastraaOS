import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import BillingSummaryCards from './components/BillingSummaryCards';
import PaymentModeChart from './components/PaymentModeChart';
import ReceivablesAgeing from './components/ReceivablesAgeing';
import OverdueInvoicesTable from './components/OverdueInvoicesTable';
import { getBillingSummary, getReceivablesAgeing } from './services/billingService';

const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const BillingOverview = () => {
    const [summary, setSummary] = useState(null);
    const [ageing, setAgeing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [consolidated, setConsolidated] = useState(false);

    const navigateMonth = (direction) => {
        setSelectedMonth(prev => {
            let m = prev + direction;
            if (m > 12) { setSelectedYear(y => y + 1); return 1; }
            if (m < 1) { setSelectedYear(y => y - 1); return 12; }
            return m;
        });
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [summaryRes, ageingRes] = await Promise.all([
                    getBillingSummary({ month: consolidated ? null : selectedMonth, year: consolidated ? null : selectedYear, consolidated }),
                    getReceivablesAgeing({ month: consolidated ? null : selectedMonth, year: consolidated ? null : selectedYear, consolidated }),
                ]);
                setSummary(summaryRes.data || summaryRes);
                setAgeing(ageingRes.data || ageingRes);
            } catch {
                // errors surfaced by empty states in children
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [selectedMonth, selectedYear, consolidated]);

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header row — title left, controls right */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <LayoutDashboard size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">Billing Overview</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!consolidated && (
                        <>
                            <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors border border-border">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-text-main min-w-[140px] text-center">
                                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors border border-border">
                                <ChevronRight size={16} />
                            </button>
                            <div className="h-6 w-px bg-border mx-1" />
                        </>
                    )}
                    <button
                        onClick={() => setConsolidated(c => !c)}
                        className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            consolidated
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface text-text-secondary border-border hover:border-primary/50 hover:text-primary'
                        }`}
                    >
                        <BarChart3 size={14} />
                        Consolidated
                    </button>
                </div>
            </div>

            <BillingSummaryCards data={summary} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentModeChart data={summary} loading={loading} />
                <ReceivablesAgeing ageing={ageing} loading={loading} />
            </div>

            <OverdueInvoicesTable />
        </motion.div>
    );
};

export default BillingOverview;
