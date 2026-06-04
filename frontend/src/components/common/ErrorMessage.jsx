import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 ${className}`}>
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <span className="leading-tight">{message}</span>
    </div>
  );
};

export default ErrorMessage;
