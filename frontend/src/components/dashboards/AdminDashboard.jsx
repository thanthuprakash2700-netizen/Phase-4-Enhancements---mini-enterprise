import React from 'react';
import { ClipboardList, TrendingUp, CheckCircle2, Zap, Activity, BarChart as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const StatsCard = ({ label, value, icon, trend }) => (
  <div className="card flex items-center gap-6">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const AdminDashboard = ({ summary, distribution, performance, aiSummary, auditLogs, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="card h-48 animate-pulse bg-slate-100" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard label="Total Tasks" value={summary?.total_tasks || 0} icon={<ClipboardList className="text-blue-500" />} trend="+12%" />
        <StatsCard label="Active Tasks" value={summary?.tasks_by_status?.in_progress || 0} icon={<TrendingUp className="text-amber-500" />} trend="+5%" />
        <StatsCard label="Completed Tasks" value={summary?.completed_tasks || 0} icon={<CheckCircle2 className="text-emerald-500" />} trend="+8%" />
        <StatsCard label="System Events" value={auditLogs?.length || 0} icon={<Activity className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChartIcon size={18} className="text-primary" /> System Performance
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="user_name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="completed_count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-indigo-500" size={18} /> Recent System Logs
            </h3>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 border border-slate-50 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase">{log.entity}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">By User ID: {log.user_id}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-sm py-6">No logs available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">AI Task Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Priority */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5">
            <h4 className="text-orange-800 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> 
              High Priority Attention Needed
            </h4>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {aiSummary?.high_priority_pending?.length > 0 ? (
                aiSummary.high_priority_pending.map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100/50">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-700 text-sm">{task.title}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-500">{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-orange-600/70 font-medium italic">No high priority tasks pending.</p>
              )}
            </div>
          </div>

          {/* Delay Risks */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
            <h4 className="text-rose-800 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> 
              Delay Risks Detected
            </h4>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {aiSummary?.delay_risks?.length > 0 ? (
                aiSummary.delay_risks.map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-xl shadow-sm border border-rose-100/50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-700 text-sm">{task.title}</span>
                    </div>
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                      Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-rose-600/70 font-medium italic">No delay risks detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
