import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, TrendingUp, CheckCircle2, FileCheck, BarChart as BarChartIcon, PieChart as PieChartIcon, Zap } from 'lucide-react';
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
      </div>
    </div>
  </div>
);

const ManagerDashboard = ({ summary, distribution, performance, aiSummary, loading }) => {
  if (loading) {
    return <div className="animate-pulse flex gap-6"><div className="h-48 bg-slate-100 rounded-xl flex-1"></div></div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard label="Team Tasks" value={summary?.total_tasks || 0} icon={<ClipboardList className="text-blue-500" />} />
        <StatsCard label="Active" value={summary?.tasks_by_status?.in_progress || 0} icon={<TrendingUp className="text-amber-500" />} />
        <StatsCard label="Pending Approvals" value={summary?.pending_approvals || 0} icon={<FileCheck className="text-purple-500" />} />
        <StatsCard label="Completed" value={summary?.completed_tasks || 0} icon={<CheckCircle2 className="text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon size={18} className="text-primary" /> Task Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="status">
                  {distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#8b5cf6', '#10b981'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChartIcon size={18} className="text-primary" /> Team Performance
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
      
      <div className="mt-8 flex justify-center">
        <Link to="/approvals" className="btn btn-primary shadow-lg shadow-primary/20">
          Review Pending Approvals
        </Link>
      </div>
    </div>
  );
};

export default ManagerDashboard;
