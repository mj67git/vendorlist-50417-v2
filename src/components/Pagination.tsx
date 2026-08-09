import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100 text-slate-500 text-xs font-medium">
      <div className="order-2 sm:order-1 text-slate-400 text-right">
        نمایش <span className="font-bold text-slate-700 font-mono">{startIndex + 1}</span> تا{" "}
        <span className="font-bold text-slate-700 font-mono">{Math.min(endIndex, totalItems)}</span> از{" "}
        <span className="font-bold text-slate-700 font-mono">{totalItems}</span> مورد
      </div>
      <div className="flex items-center gap-1.5 order-1 sm:order-2" dir="ltr">
        {/* Previous page arrow. In LTR layout (for the buttons row), previous is left arrow.
            Since dir="ltr" on the buttons row, ChevronLeft will point to the left (prev page)
            and ChevronRight will point to the right (next page).
            This is extremely clean and avoids visual confusion of arrow directions. */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="صفحه قبل"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Truncation logic to show only relevant pages
          const isNear = Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages;
          if (!isNear) {
            if (p === 2 || p === totalPages - 1) {
              return <span key={p} className="px-1 text-slate-400 font-mono select-none">...</span>;
            }
            return null;
          }
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-xl font-bold font-mono transition-all cursor-pointer ${
                currentPage === p
                  ? "bg-[#0071E3] text-white shadow-sm"
                  : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="صفحه بعد"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
