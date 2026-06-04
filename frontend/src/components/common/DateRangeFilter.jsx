import React from 'react';

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, label = "Date Range" }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none transition-all"
        />
        <span className="text-slate-400 font-medium">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
