import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Clock, AlertTriangle, CheckCircle, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching task details
    setTimeout(() => {
      setTask({
        id: id,
        title: id === 'TSK-552' ? 'Fix login page bug' : 'Update server configurations',
        description: 'Need to update the Nginx configurations to support the new websocket connections for live notifications.',
        assignee: 'Alice Johnson',
        priority: 'High',
        status: 'In Progress',
        slaStatus: id === 'TSK-552' ? 'BREACHED' : 'ACTIVE',
        slaDueTime: id === 'TSK-552' ? 'Yesterday, 9:00 AM' : 'Today, 5:00 PM',
        isSlaBreached: id === 'TSK-552',
        timeRemaining: id === 'TSK-552' ? '-24h 10m' : '4h 30m',
        createdAt: 'Oct 23, 2023 10:00 AM'
      });
      setLoading(false);
    }, 400);
  }, [id]);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading task details...</div>;
  }

  if (!task) {
    return <div className="p-8 text-red-500">Task not found</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-page">
      <div className="max-w-4xl mx-auto">
        <Link to="/tasks" className="inline-flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
          <ChevronLeft size={18} /> Back to Tasks
        </Link>
        
        {/* SLA Banner */}
        {task.isSlaBreached ? (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full text-red-600 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-lg">SLA Breached</h4>
              <p className="text-red-700 text-sm mt-1">This task has missed its SLA deadline of <strong>{task.slaDueTime}</strong>. Please prioritize completion immediately.</p>
            </div>
          </motion.div>
        ) : task.slaStatus === 'COMPLETED_WITHIN_SLA' ? (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <h4 className="font-bold text-emerald-900">Task completed within SLA.</h4>
          </motion.div>
        ) : (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Active SLA</h4>
                <p className="text-blue-700 text-sm">Due by: {task.slaDueTime}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs text-blue-500 font-bold uppercase tracking-wider">Remaining</span>
              <span className="text-xl font-bold text-blue-900">{task.timeRemaining}</span>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold tracking-wider">{task.id}</span>
                <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider ${task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {task.priority} PRIORITY
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
            </div>
            <button className="btn-primary">Update Status</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileText size={16} /> Description
                </h3>
                <p className="text-slate-700 leading-relaxed">{task.description}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={14} /> Assignee
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {task.assignee.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-800">{task.assignee}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</h3>
                <span className="font-semibold text-slate-800">{task.status}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Created</h3>
                <span className="text-sm font-medium text-slate-600">{task.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
