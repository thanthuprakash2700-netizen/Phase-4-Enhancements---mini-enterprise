import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, Activity, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ActivityFeed from './ActivityFeed';

const TaskModal = ({ isOpen, onClose, task, users = [], onSave }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState(task ? {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    attention_required: task.attention_required || false,
    delay_risk: task.delay_risk || 'low',
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    assigned_to_id: task.assigned_to_id || ''
  } : {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    attention_required: false,
    delay_risk: 'low',
    due_date: '',
    assigned_to_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.assigned_to_id) payload.assigned_to_id = null;
      if (!payload.due_date) payload.due_date = null;

      if (task) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks/', payload);
      }
      onSave();
    } catch (error) {
      alert('Failed to save task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-white flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">{task ? 'Task Details' : 'New Task'}</h2>
            <p className="text-sm text-slate-500 font-medium">{task ? task.title : 'Define a new enterprise objective'}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-2xl transition-all duration-200">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        
        {task && (
          <div className="flex border-b border-slate-100 px-8 shrink-0">
            <button 
              className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={16} /> Details
            </button>
            <button 
              className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              onClick={() => setActiveTab('activity')}
            >
              <Activity size={16} /> Activity History
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-8 min-h-[400px]">
          {activeTab === 'details' ? (
            <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                <input 
                  required
                  className="input py-3.5"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Q3 Performance Review"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                <textarea 
                  className="input min-h-[120px] py-4"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide context and expectations..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    className="input py-3.5 appearance-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input 
                    type="date"
                    className="input py-3.5"
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Delay Risk</label>
                  <select 
                    className="input py-3.5 appearance-none"
                    value={formData.delay_risk}
                    onChange={e => setFormData({...formData, delay_risk: e.target.value})}
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                
                <div className="flex items-center pt-8">
                  <label className="flex items-center cursor-pointer gap-3 relative z-10">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={formData.attention_required}
                        onChange={e => setFormData({...formData, attention_required: e.target.checked})}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${formData.attention_required ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.attention_required ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">High Priority Attention</span>
                      <span className="text-xs text-slate-500 font-medium">Flag for immediate review</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Assignee</label>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await api.get('/tasks/smart-assign-suggestions');
                          if (res.data && res.data.length > 0) {
                            const bestMatch = res.data[0];
                            setFormData({...formData, assigned_to_id: bestMatch.user_id});
                            // Attach a temporary reason to display in UI
                            setFormData(prev => ({...prev, _smartAssignReason: bestMatch.reason}));
                          } else {
                            alert('No suitable candidates found.');
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                      ✨ Smart Assign (AI)
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <select 
                    className="input pl-12 py-3.5 appearance-none"
                    value={formData.assigned_to_id}
                    onChange={e => {
                      setFormData({...formData, assigned_to_id: e.target.value, _smartAssignReason: null});
                    }}
                  >
                    <option value="">Unassigned</option>
                    {(Array.isArray(users) ? users : [])
                      .filter(u => user.role === 'admin' || (user.role === 'manager' && u.role === 'employee'))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                {formData._smartAssignReason && (
                  <p className="text-xs text-emerald-600 font-medium ml-1 mt-1 animate-pulse">
                    ✨ AI Recommendation: {formData._smartAssignReason}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
               <ActivityFeed entity="TASK" entityId={task.id} />
            </div>
          )}
        </div>
        
        {activeTab === 'details' && (
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-4 rounded-2xl font-bold">Cancel</button>
            <button type="submit" form="task-form" className="btn btn-primary gradient-primary flex-1 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
              {task ? 'Save Changes' : 'Launch Task'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TaskModal;
