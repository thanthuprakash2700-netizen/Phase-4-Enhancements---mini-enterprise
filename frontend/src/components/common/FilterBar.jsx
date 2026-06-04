import React from 'react';

const FilterBar = ({ children, className = "" }) => {
  return (
    <div className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end mb-6 ${className}`}>
      {children}
    </div>
  );
};

export default FilterBar;
