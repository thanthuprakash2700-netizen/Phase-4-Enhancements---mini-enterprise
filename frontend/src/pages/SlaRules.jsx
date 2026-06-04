import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Edit2, ShieldOff, CheckCircle, Search, Filter, X, Save } from 'lucide-react';
import { slaService } from '../services/slaService';
import ErrorMessage from '../components/common/ErrorMessage';

const SlaRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [error, setError] = useState(null);
  
  // Filters
  const [moduleFilter, setModuleFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    moduleName: 'Task',
    priority: 'High',
    allowedHours: 24,
    escalationEnabled: true,
    escalationAfterHours: 4,
    isActive: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      // Dummy data for now as API might not exist yet
      const dummyRules = [
        { id: 'SLA-001', moduleName: 'Task', priority: 'High', allowedHours: 24, escalationEnabled: true, escalationAfterHours: 12, isActive: true },
        { id: 'SLA-002', moduleName: 'Approval', priority: 'Medium', allowedHours: 48, escalationEnabled: true, escalationAfterHours: 24, isActive: true },
        { id: 'SLA-003', moduleName: 'Task', priority: 'Low', allowedHours: 72, escalationEnabled: false, escalationAfterHours: 0, isActive: false },
      ];
      setRules(dummyRules);
    } catch (error) {
      console.error('Error fetching SLA rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(r => {
    return (moduleFilter === 'All' || r.moduleName === moduleFilter) &&
           (priorityFilter === 'All' || r.priority === priorityFilter);
  });

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData(rule);
    } else {
      setEditingRule(null);
      setFormData({
        moduleName: 'Task',
        priority: 'High',
        allowedHours: 24,
        escalationEnabled: true,
        escalationAfterHours: 4,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.moduleName) {
      setError("Module name must be selected");
      return;
    }
    if (!formData.priority) {
      setError("Priority must be selected");
      return;
    }
    if (formData.allowedHours <= 0) {
      setError("Allowed hours must be greater than 0");
      return;
    }
    if (formData.escalationEnabled && formData.escalationAfterHours <= 0) {
      setError("Escalation hours must be greater than 0");
      return;
    }

    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...formData, id: r.id } : r));
    } else {
      const newRule = { ...formData, id: `SLA-00${rules.length + 1}` };
      setRules([...rules, newRule]);
    }
    handleCloseModal();
  };

  const handleToggleStatus = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-600 border-red-200';
      case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Low': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="text-primary" size={32} />
            SLA Rules Management
          </h1>
          <p className="text-slate-500 mt-2">Configure Service Level Agreements for Tasks and Approvals.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          Create SLA Rule
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <span className="font-medium text-slate-700">Filters:</span>
        </div>
        
        <select 
          className="input max-w-xs" 
          value={moduleFilter} 
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="All">All Modules</option>
          <option value="Task">Task</option>
          <option value="Approval">Approval</option>
        </select>

        <select 
          className="input max-w-xs" 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Rule ID</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Allowed Hours</th>
                <th className="px-6 py-4">Escalation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{rule.id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                      {rule.moduleName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(rule.priority)}`}>
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{rule.allowedHours} hrs</td>
                  <td className="px-6 py-4">
                    {rule.escalationEnabled ? (
                      <span className="text-orange-600 font-medium text-xs bg-orange-50 px-2 py-1 rounded">
                        After {rule.escalationAfterHours} hrs
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${rule.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {rule.isActive ? <CheckCircle size={14} /> : <ShieldOff size={14} />}
                      {rule.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(rule)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(rule.id)}
                        className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${rule.isActive ? 'text-slate-500 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'}`}
                      >
                        {rule.isActive ? <ShieldOff size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No SLA rules found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingRule ? 'Edit SLA Rule' : 'Create New SLA Rule'}
                </h2>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <ErrorMessage message={error} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Module Name</label>
                    <select 
                      className="input w-full"
                      value={formData.moduleName}
                      onChange={(e) => setFormData({...formData, moduleName: e.target.value})}
                    >
                      <option value="Task">Task</option>
                      <option value="Approval">Approval</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                    <select 
                      className="input w-full"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Allowed Hours</label>
                  <input 
                    type="number" 
                    min="1"
                    className="input w-full"
                    value={formData.allowedHours}
                    onChange={(e) => setFormData({...formData, allowedHours: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-slate-500 mt-1">Time limit before SLA is breached.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Enable Escalation</h4>
                      <p className="text-xs text-slate-500">Automatically escalate if SLA breaches.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.escalationEnabled}
                        onChange={(e) => setFormData({...formData, escalationEnabled: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  {formData.escalationEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2 border-t border-slate-200"
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Escalation After (Hours)</label>
                      <input 
                        type="number" 
                        min="1"
                        className="input w-full bg-white"
                        value={formData.escalationAfterHours}
                        onChange={(e) => setFormData({...formData, escalationAfterHours: parseInt(e.target.value)})}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-medium text-slate-700">Rule Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">{formData.isActive ? 'Active' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save size={18} />
                    {editingRule ? 'Save Changes' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlaRules;
