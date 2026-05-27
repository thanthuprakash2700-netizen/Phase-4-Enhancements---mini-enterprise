import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, TrendingUp, CheckCircle2, FileCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatsCard = ({ label, value, icon }) => (
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

const EmployeeDashboard = ({ summary, filteredTasks, loading, TaskCard, user, handleDelete, setEditingTask, setShowModal, handleStatusChange }) => {
  if (loading) {
    return <div className="animate-pulse flex gap-6"><div className="h-48 bg-slate-100 rounded-xl flex-1"></div></div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard label="My Tasks" value={summary?.total_tasks || 0} icon={<ClipboardList className="text-blue-500" />} />
        <StatsCard label="In Progress" value={summary?.tasks_by_status?.in_progress || 0} icon={<TrendingUp className="text-amber-500" />} />
        <StatsCard label="My Requests" value={summary?.pending_approvals || 0} icon={<FileCheck className="text-purple-500" />} />
        <StatsCard label="Completed" value={summary?.completed_tasks || 0} icon={<CheckCircle2 className="text-emerald-500" />} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">My Task Queue</h3>
        <Link to="/kanban" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
          View Kanban <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.slice(0, 6).map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                user={user}
                onDelete={handleDelete}
                onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              No tasks assigned yet. You're all caught up!
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
