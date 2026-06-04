import React from 'react';
import { Database } from 'lucide-react';

const EmptyState = ({ icon: Icon = Database, title = "No Data Found", message = "There is currently no data to display here.", action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-400">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{message}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
