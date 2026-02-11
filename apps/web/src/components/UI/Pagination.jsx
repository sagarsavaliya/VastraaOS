import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1
}) => {
    if (totalPages <= 1) return null;

    const range = (start, end) => {
        let length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    };

    const getPageNumbers = () => {
        const totalPageNumbers = siblingCount + 5;

        // Case 1: Total pages less than the page numbers we want to show
        if (totalPageNumbers >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, 'DOTS', totalPages];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [firstPageIndex, 'DOTS', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex];
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-center space-x-1" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-border rounded-lg text-text-secondary hover:bg-background-content/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((number, index) => {
                if (number === 'DOTS') {
                    return (
                        <div key={`dots-${index}`} className="w-9 h-9 flex items-center justify-center text-text-muted">
                            <MoreHorizontal size={16} />
                        </div>
                    );
                }

                const isActive = number === currentPage;

                return (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isActive
                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                            : 'text-text-secondary border border-transparent hover:border-border hover:bg-background-content/50'
                            }`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {number}
                    </button>
                );
            })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-border rounded-lg text-text-secondary hover:bg-background-content/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
};

export default Pagination;
