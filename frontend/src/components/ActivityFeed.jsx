import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Clock, CheckCircle2, User, FileText, MessageSquare, Edit2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityFeed = ({ entity, entityId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/audit-logs/entity/${entity}/${entityId}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch activity feed", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (entity && entityId) {
      fetchLogs();
    }
  }, [entity, entityId]);

  const getActionDetails = (log) => {
    const action = log.action.toUpperCase();
    const details = log.details || {};
    
    if (action.includes('STATUS')) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">{details.old_status || 'UNKNOWN'}</span>
          <span className="text-slate-400">→</span>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">{details.new_status || 'UNKNOWN'}</span>
        </div>
      );
    }
    
    if (action.includes('COMMENT')) {
      return (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
          "{details.content}"
        </div>
      );
    }
    
    if (action.includes('UPLOAD') || action.includes('DOWNLOAD')) {
      return (
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 font-medium">
          <FileText size={14} className="text-blue-500" /> {details.file_name} {details.version ? `(v${details.version})` : ''}
        </div>
      );
    }

    if (action.includes('CREATE') || action.includes('ASSIGN')) {
      return details.title ? (
        <div className="mt-1 text-sm text-slate-600 font-medium">"{details.title}"</div>
      ) : null;
    }

    return null;
  };

  const getIcon = (action) => {
    action = action.toUpperCase();
    if (action.includes('STATUS')) return <Activity size={16} className="text-primary" />;
    if (action.includes('COMMENT')) return <MessageSquare size={16} className="text-purple-500" />;
    if (action.includes('DOCUMENT') || action.includes('UPLOAD')) return <FileText size={16} className="text-blue-500" />;
    if (action.includes('CREATE')) return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (action.includes('ASSIGN')) return <User size={16} className="text-amber-500" />;
    if (action.includes('UPDATE')) return <Edit2 size={16} className="text-indigo-500" />;
    return <Clock size={16} className="text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
            <div className="h-16 flex-1 bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400">
        <AlertCircle size={32} className="mb-3 opacity-20" />
        <p className="text-sm font-medium">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 p-2">
      {/* Timeline Line */}
      <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-100"></div>
      
      <div className="space-y-6">
        {logs.map((log, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={log.id} 
            className="flex gap-4 relative z-10"
          >
            <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
              {getIcon(log.action)}
            </div>
            
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-800 text-sm">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">User ID: {log.user_id || 'System'}</p>
              
              {getActionDetails(log)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
