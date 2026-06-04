import React, { useState, useEffect } from 'react';
import { ListTodo, Search, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatusBadge from '../components/common/StatusBadge';
import SLABadge from '../components/common/SLABadge';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for Tasks
    setTimeout(() => {
      setTasks([
        { id: 'TSK-550', title: 'Update server configurations', assignee: 'John Doe', priority: 'High', status: 'In Progress', slaStatus: 'ACTIVE', slaDueTime: 'Today, 5:00 PM', isSlaBreached: false },
        { id: 'TSK-551', title: 'Review Q3 Financials', assignee: 'Jane Smith', priority: 'Medium', status: 'Done', slaStatus: 'COMPLETED_WITHIN_SLA', slaDueTime: 'Yesterday, 12:00 PM', isSlaBreached: false },
        { id: 'TSK-552', title: 'Fix login page bug', assignee: 'Alice Johnson', priority: 'High', status: 'To Do', slaStatus: 'BREACHED', slaDueTime: 'Yesterday, 9:00 AM', isSlaBreached: true },
        { id: 'TSK-553', title: 'Prepare onboarding docs', assignee: 'Bob Brown', priority: 'Low', status: 'In Progress', slaStatus: 'ACTIVE', slaDueTime: 'Tomorrow, 3:00 PM', isSlaBreached: false },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (p) => {
    if (p === 'High') return 'text-red-500 bg-red-50';
    if (p === 'Medium') return 'text-orange-500 bg-orange-50';
    return 'text-blue-500 bg-blue-50';
  };

  return (
    <div className="p-8 min-h-screen bg-page">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ListTodo className="text-primary" size={32} />
            Tasks List
          </h1>
          <p className="text-slate-500 mt-2">Manage tasks and monitor their SLA states.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="input pl-12 py-3 bg-white w-full md:w-72"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">SLA Status</th>
                <th className="px-6 py-4">Due Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500">Loading tasks...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500">No tasks found.</td></tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{task.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{task.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} className="uppercase tracking-widest text-[10px]" />
                    </td>
                    <td className="px-6 py-4">
                      <SLABadge status={task.slaStatus} className="uppercase tracking-widest text-[10px]" />
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <div className={`flex items-center gap-1.5 ${task.isSlaBreached ? 'text-red-600' : 'text-slate-500'}`}>
                        {task.isSlaBreached ? <AlertCircle size={14} /> : <Clock size={14} />}
                        {task.slaDueTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/tasks/${task.id}`} className="inline-flex items-center gap-1 text-primary hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                        View Details <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TasksList;
