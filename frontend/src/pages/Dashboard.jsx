import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ClipboardList, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Calendar, 
  UserPlus,
  FileCheck,
  BarChart as BarChartIcon, 
  TrendingUp, 
  PieChart as PieChartIcon,
  User as UserIcon,
  Zap,
  Bell,
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../services/dashboardService';
import TaskModal from '../components/TaskModal';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { lastMessage } = useWebSocket();
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, summaryRes, distRes, perfRes, aiRes, notifRes] = await Promise.all([
        api.get('/tasks/'),
        dashboardService.getSummary(),
        dashboardService.getTaskDistribution(),
        dashboardService.getPerformance(),
        api.get('/dashboard/ai-summary'),
        api.get('/notifications/')
      ]);
      
      setTasks(tasksRes.data.items || tasksRes.data || []);
      setSummary(summaryRes.data);
      setDistribution(distRes.data);
      setPerformance(perfRes.data);
      setAiSummary(aiRes.data);
      setNotifications(notifRes.data.items || notifRes.data || []);

      if (user?.role === 'admin') {
        const logsRes = await api.get('/audit-logs/');
        setAuditLogs(logsRes.data.items || logsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const fetchUsers = useCallback(async () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      try {
        const response = await api.get('/users/');
        setUsers(response.data.items || response.data || []);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchUsers();
    }
  }, [fetchData, fetchUsers, user]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'NOTIFICATION_NEW') {
        api.get('/notifications/').then(res => {
          setNotifications(res.data.items || res.data || []);
          setToastNotification(lastMessage.message || "New notification received");
          setTimeout(() => setToastNotification(null), 5000);
        }).catch(console.error);
      } else if (['TASK_CREATED', 'TASK_UPDATED', 'APPROVAL_REQUESTED', 'APPROVAL_UPDATED'].includes(lastMessage.type)) {
        fetchData();
      }
    }
  }, [lastMessage, fetchData]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        alert('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] bg-white border border-slate-100 shadow-2xl shadow-primary/10 px-6 py-4 rounded-2xl flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">New Notification</h4>
              <p className="text-slate-500 text-xs mt-0.5">{toastNotification}</p>
            </div>
            <button onClick={() => setToastNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">
              <Plus className="rotate-45" size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Enterprise Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.name?.split(' ')[0]}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-white rounded-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-all relative shadow-sm border border-slate-100"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-black/10 border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">Notifications</h4>
                    {unreadCount > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                          className={`p-3 rounded-xl mb-1 cursor-pointer transition-colors ${notif.is_read ? 'opacity-60 hover:bg-slate-50' : 'bg-primary/5 hover:bg-primary/10'}`}
                        >
                          <p className="text-sm text-slate-700 font-medium">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">{new Date(notif.created_at).toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                    <Link 
                      to="/notifications" 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 w-full md:w-64"
            />
          </div>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button 
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              className="btn btn-primary gradient-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </header>

      {/* Role-Based Dashboard View */}
      {user.role === 'admin' && (
        <AdminDashboard 
          summary={summary} 
          distribution={distribution} 
          performance={performance} 
          aiSummary={aiSummary} 
          auditLogs={auditLogs} 
          loading={loading} 
        />
      )}
      
      {user.role === 'manager' && (
        <ManagerDashboard 
          summary={summary} 
          distribution={distribution} 
          performance={performance} 
          aiSummary={aiSummary}
          loading={loading} 
        />
      )}
      
      {user.role === 'employee' && (
        <EmployeeDashboard 
          summary={summary} 
          filteredTasks={filteredTasks} 
          loading={loading} 
          TaskCard={TaskCard}
          user={user}
          handleDelete={handleDelete}
          setEditingTask={setEditingTask}
          setShowModal={setShowModal}
          handleStatusChange={handleStatusChange}
        />
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            task={editingTask}
            users={users}
            onSave={() => { setShowModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};



const TaskCard = ({ task, user, onDelete, onEdit, onStatusChange }) => {
  const statusColors = {
    todo: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
    review: 'bg-purple-50 text-purple-600 border-purple-100',
    done: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  const statusIcons = {
    todo: <Circle size={14} />,
    in_progress: <Clock size={14} />,
    review: <Clock size={14} />,
    done: <CheckCircle2 size={14} />
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-500',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-rose-100 text-rose-600'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="card group relative"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${
        task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-300'
      }`} />
      
      <div className="flex justify-between items-start mb-5 pl-2">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${statusColors[task.status]} flex items-center gap-1.5`}>
          {statusIcons[task.status]}
          {task.status.replace('_', ' ')}
        </span>
        
        {(user.role === 'admin' || (user.role === 'manager' && task.created_by_id === user.id)) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button onClick={() => onEdit(task)} className="p-2 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-800 mb-3 truncate text-lg group-hover:text-primary transition-colors pl-2 flex items-center gap-2">
        {task.attention_required && <AlertCircle size={18} className="text-rose-500 animate-pulse shrink-0" />}
        {task.title}
      </h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed pl-2 font-medium">
        {task.description || 'No additional details provided.'}
      </p>

      <div className="flex items-center justify-between pt-5 border-t border-slate-50 pl-2">
        <div className="flex items-center gap-4">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.delay_risk && task.delay_risk !== 'low' && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${task.delay_risk === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
              Risk: {task.delay_risk}
            </span>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={14} className="opacity-70" />
              <span className="text-[11px] font-bold">{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {task.assigned_to_id ? (
              <div className="w-8 h-8 rounded-full gradient-primary text-white border-2 border-white flex items-center justify-center text-[11px] font-bold shadow-sm" title={`Assigned to ${task.assigned_to_name}`}>
                {(task.assigned_to_name || 'U').charAt(0)}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border-2 border-white flex items-center justify-center shadow-sm" title="Unassigned">
                <UserIcon size={14} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pl-2">
        {task.status !== 'done' && (
          <button 
            onClick={() => {
              let nextStatus = 'in_progress';
              if (task.status === 'in_progress') nextStatus = 'review';
              else if (task.status === 'review') nextStatus = 'done';
              else if (task.status === 'todo') nextStatus = 'in_progress';
              onStatusChange(task, nextStatus);
            }}
            className="w-full py-2.5 bg-slate-50 hover:bg-primary hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-slate-100 hover:border-primary shadow-sm hover:shadow-primary/20"
          >
            <ChevronRight size={16} /> Next Stage
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
