import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, action }) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-xl text-primary hidden md:block">
            <Icon size={28} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
