import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import StatCard from '../../../components/UI/StatCard';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const BillingSummaryCards = ({ data, loading }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Invoiced This Month"
                value={formatINR(data?.current_month?.invoiced)}
                subtitle="Total billed amount"
                icon={FileText}
                loading={loading}
            />
            <StatCard
                title="Collected This Month"
                value={formatINR(data?.current_month?.collected)}
                subtitle="Payments received"
                icon={CheckCircle}
                loading={loading}
            />
            <StatCard
                title="Outstanding"
                value={formatINR(data?.outstanding?.total_amount)}
                subtitle="Pending collection"
                icon={Clock}
                loading={loading}
            />
            <StatCard
                title="Overdue"
                value={formatINR(data?.overdue?.amount)}
                subtitle={`${data?.overdue?.count || 0} invoices past due`}
                icon={AlertCircle}
                loading={loading}
            />
        </div>
    );
};

export default BillingSummaryCards;
