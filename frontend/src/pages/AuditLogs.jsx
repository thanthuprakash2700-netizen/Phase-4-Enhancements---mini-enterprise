import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, Clock, FileText, CheckCircle2, User as UserIcon, MessageSquare, Edit2, AlertCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs/');
      setLogs(res.data.items || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8">Not authorized</div>;
  }

  const getIcon = (action) => {
    action = action.toUpperCase();
    if (action.includes('STATUS')) return <Activity size={18} className="text-primary" />;
    if (action.includes('COMMENT')) return <MessageSquare size={18} className="text-purple-500" />;
    if (action.includes('DOCUMENT') || action.includes('UPLOAD')) return <FileText size={18} className="text-blue-500" />;
    if (action.includes('CREATE')) return <CheckCircle2 size={18} className="text-emerald-500" />;
    if (action.includes('ASSIGN')) return <UserIcon size={18} className="text-amber-500" />;
    if (action.includes('UPDATE')) return <Edit2 size={18} className="text-indigo-500" />;
    return <Database size={18} className="text-slate-400" />;
  };

  const renderDetails = (log) => {
    if (!log.details) return null;
    const details = log.details;
    const action = log.action.toUpperCase();

    if (action.includes('STATUS')) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">{details.old_status || 'UNKNOWN'}</span>
          <span className="text-slate-400">→</span>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">{details.new_status || 'UNKNOWN'}</span>
        </div>
      );
    }
    
    if (action.includes('COMMENT')) {
      return (
        <div className="mt-2 p-3 bg-white rounded-lg border border-slate-100 text-sm text-slate-600 italic">
          "{details.content}"
        </div>
      );
    }

    if (action.includes('UPLOAD') || action.includes('DOWNLOAD')) {
      return (
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 font-medium">
          <FileText size={14} className="text-blue-500" /> {details.file_name} {details.version ? `(v${details.version})` : ''}
        </div>
      );
    }

    return (
      <div className="mt-2 text-xs font-mono bg-white p-2 rounded border border-slate-100 text-slate-600 overflow-x-auto">
        <pre>{JSON.stringify(details, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
        <p className="text-slate-500 font-medium mt-2">Monitor all system activities, permission changes, and data updates.</p>
      </header>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex-1 relative">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xl">Global Activity Timeline</h3>
            <p className="text-sm text-slate-500">Real-time stream of all enterprise events</p>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl" />)}
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[39px] top-6 bottom-6 w-px bg-slate-100"></div>
            <div className="space-y-6">
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 1) }}
                    key={log.id} 
                    className="flex gap-6 relative z-10"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shrink-0 shadow-sm mt-1">
                      {getIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                            {log.entity} #{log.entity_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">User ID: <span className="text-slate-700">{log.user_id || 'System'}</span></p>
                      
                      {renderDetails(log)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">No system activity logged yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
