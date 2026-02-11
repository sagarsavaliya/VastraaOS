import { Package, Calendar, User } from 'lucide-react';
import DataTable from '../../../components/UI/DataTable';

const RecentOrdersTable = ({
    orders = [],
    loading = false,
    meta = {},
    onSearch,
    onPageChange,
    onLimitChange,
    searchQuery = '',
    perPage = 5,
    sortConfig,
    onSort
}) => {
    const getStatusColor = (color) => color || '#6366f1';
    const getPriorityColor = (color) => color || '#64748b';

    const columns = [
        { header: 'Order', key: 'order_number' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Amount', key: 'total_amount' },
        { header: 'Status', key: 'order_status_id' },
        { header: 'Priority', key: 'order_priority_id' },
        { header: 'Delivery', key: 'promised_delivery_date' },
    ];

    const renderRow = (order) => (
        <tr key={order.id} className="hover:bg-background-content/30 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main group-hover:text-primary transition-colors">
                {order.order_number}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                <div className="flex items-center gap-2">
                    <User size={14} className="text-text-muted" />
                    {order.customer_name}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-main">
                ₹{order.total_amount?.toLocaleString('en-IN')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                    style={{
                        backgroundColor: `${getStatusColor(order.status_color)}15`,
                        color: getStatusColor(order.status_color),
                        borderColor: `${getStatusColor(order.status_color)}30`
                    }}
                >
                    {order.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                    style={{
                        backgroundColor: `${getPriorityColor(order.priority_color)}15`,
                        color: getPriorityColor(order.priority_color),
                        borderColor: `${getPriorityColor(order.priority_color)}30`
                    }}
                >
                    {order.priority}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {order.promised_delivery_date || 'N/A'}
                </div>
            </td>
        </tr>
    );

    return (
        <DataTable
            title="Recent Orders"
            icon={Package}
            columns={columns}
            data={orders}
            loading={loading}
            searchQuery={searchQuery}
            onSearch={onSearch}
            meta={meta}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            perPage={perPage}
            renderRow={renderRow}
            emptyMessage="No recent orders found"
            searchPlaceholder="Search orders..."
            sortConfig={sortConfig}
            onSort={onSort}
        />
    );
};

export default RecentOrdersTable;
