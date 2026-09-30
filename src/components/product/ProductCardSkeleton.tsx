import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1F2937] overflow-hidden animate-pulse flex flex-col">
      <div className="w-full pt-[75%] bg-[#1F2937]/50" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-[#1F2937] rounded" />
            <div className="h-3 w-12 bg-[#1F2937] rounded" />
          </div>
          <div className="h-4 w-full bg-[#1F2937] rounded" />
          <div className="h-4 w-4/5 bg-[#1F2937] rounded" />
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 w-12 bg-[#1F2937] rounded" />
            <div className="h-4 w-12 bg-[#1F2937] rounded" />
          </div>
        </div>
        <div className="pt-3 border-t border-[#1F2937] flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-5 w-24 bg-[#1F2937] rounded" />
            <div className="h-3 w-16 bg-[#1F2937] rounded" />
          </div>
          <div className="w-9 h-9 bg-[#1F2937] rounded-xl" />
        </div>
      </div>
    </div>
  );
};
