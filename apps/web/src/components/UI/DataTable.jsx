import React from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Pagination from './Pagination';

const DataTable = ({
    title,
    icon: Icon,
    columns = [],
    data = [],
    loading = false,
    searchQuery = '',
    onSearch = () => { },
    meta = {},
    onPageChange = () => { },
    onLimitChange = () => { },
    perPage = 10,
    renderRow,
    filters,
    emptyMessage = "No records found",
    searchPlaceholder = "Search...",
    headerAction: HeaderAction,
    sortConfig = { key: null, direction: 'asc' },
    onSort,
    minHeight = "250px"
}) => {
    const [searchFocused, setSearchFocused] = React.useState(false);

    const handleSort = (key) => {
        if (!onSort || !key) return;

        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        onSort(key, direction);
    };

    const renderSortIcon = (colKey) => {
        if (!colKey || !onSort) return null;
        if (sortConfig.key !== colKey) return <ArrowUpDown size={14} className="ml-1.5 opacity-0 group-hover:opacity-50 transition-opacity" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="ml-1.5 text-primary" />
            : <ArrowDown size={14} className="ml-1.5 text-primary" />;
    };

    return (
        <div className="bg-surface rounded-2xl overflow-hidden border border-border flex flex-col shadow-sm relative z-0">
            {/* Table Header with Search and Actions */}
            <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Icon size={20} />
                        </div>
                    )}
                    <h3 className="font-bold text-text-main tracking-tight">{title}</h3>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-3 w-full md:w-auto">

                    {/* Integrated Filters */}
                    {filters && (
                        <div className="flex items-center gap-3 w-full md:w-auto py-1 px-1">
                            {filters}
                        </div>
                    )}

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Header Action moved next to search */}
                        {HeaderAction && (
                            <div className="shrink-0">
                                <HeaderAction />
                            </div>
                        )}

                        {/* Styled Search Input */}
                        <div className={`
                            relative group transition-all duration-300 w-full md:w-80
                            ${searchFocused ? 'scale-[1.01]' : 'scale-100'}
                        `}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search
                                    size={18}
                                    className={`transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-text-muted'}`}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                onChange={(e) => onSearch(e.target.value)}
                                className="
                                    block w-full pl-10 pr-4 h-9
                                    bg-background border border-border
                                    rounded-xl text-sm text-text-main placeholder-text-muted
                                    outline-none
                                    transition-all duration-200
                                "
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Table Content */}
            <div
                className="overflow-x-auto rounded-b-2xl bg-surface"
                style={{ minHeight }}
            >
                <table className="w-full">
                    <thead className="bg-background-content/50 border-b border-border">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    onClick={() => handleSort(col.key)}
                                    className={`
                                        px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider 
                                        ${col.key ? 'cursor-pointer hover:text-primary transition-colors group' : ''}
                                        ${col.className || ''}
                                    `}
                                >
                                    <div className="flex items-center">
                                        {col.header}
                                        {renderSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            [...Array(perPage)].map((_, i) => (
                                <tr key={i}>
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 bg-background-content rounded w-3/4 animate-shimmer"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center text-text-muted bg-background-content/5">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-background rounded-2xl shadow-sm">
                                            {Icon ? <Icon size={40} className="text-text-muted opacity-20" /> : <Search size={40} className="text-text-muted opacity-20" />}
                                        </div>
                                        <div className="max-w-xs">
                                            <p className="text-base font-semibold text-text-main">{emptyMessage}</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => renderRow(item, index))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && (meta.total > 0 || meta.total === 0) && (
                <div className="p-4 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-4 bg-surface">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                            <span>Show</span>
                            <div className="relative">
                                <select
                                    value={perPage}
                                    onChange={(e) => onLimitChange(Number(e.target.value))}
                                    className="appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-1.5 text-text-main font-medium focus:outline-none focus:border-primary/50 cursor-pointer"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                    <ArrowDown size={12} />
                                </div>
                            </div>
                            <span>entries</span>
                        </div>
                        <div className="h-4 w-px bg-border hidden sm:block"></div>
                        <div className="font-medium">
                            Showing <span className="text-text-main">
                                {(((meta.current_page || meta.page) || 1) - 1) * perPage + 1}
                            </span> to <span className="text-text-main">
                                {Math.min(((meta.current_page || meta.page) || 1) * perPage, meta.total || data.length)}
                            </span> of <span className="text-text-main">{meta.total || data.length}</span> results
                        </div>
                    </div>

                    <Pagination
                        currentPage={(meta.current_page || meta.page) || 1}
                        totalPages={(meta.last_page || meta.last) || 1}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default DataTable;
