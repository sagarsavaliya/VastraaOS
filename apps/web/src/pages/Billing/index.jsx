import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/UI/PageHeader';
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

    const currentMonthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [summaryRes, ageingRes] = await Promise.all([
                    getBillingSummary(),
                    getReceivablesAgeing(),
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
    }, []);

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <PageHeader
                title="Billing Overview"
                subtitle={currentMonthLabel}
                icon={LayoutDashboard}
            />

            <BillingSummaryCards data={summary} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <PaymentModeChart data={summary} />
                </div>
                <div className="lg:col-span-2">
                    <ReceivablesAgeing ageing={ageing} />
                </div>
            </div>

            <OverdueInvoicesTable />
        </motion.div>
    );
};

export default BillingOverview;
