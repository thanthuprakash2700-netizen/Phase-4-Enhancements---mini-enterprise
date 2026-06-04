import React, { useState, useEffect } from 'react';
import { Users, Plus, Calendar, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from '../components/common/ErrorMessage';

const ApprovalDelegations = () => {
  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    delegatee: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setDelegations([
        { id: 'DEL-001', delegator: 'Current User', delegatee: 'Jane Smith', startDate: '2023-11-01', endDate: '2023-11-15', reason: 'Annual Leave', status: 'Active' },
        { id: 'DEL-002', delegator: 'Current User', delegatee: 'Bob Brown', startDate: '2023-10-10', endDate: '2023-10-12', reason: 'Conference', status: 'Expired' },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.delegatee) {
      setError("Delegatee must be selected");
      return;
    }
    if (!formData.startDate) {
      setError("Start date is required");
      return;
    }
    if (!formData.endDate) {
      setError("End date is required");
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date");
      return;
    }
    if (!formData.reason.trim()) {
      setError("Reason is required for delegation");
      return;
    }

    const newDel = {
      id: `DEL-00${delegations.length + 1}`,
      delegator: 'Current User',
      delegatee: formData.delegatee,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'Active'
    };
    setDelegations([newDel, ...delegations]);
    setIsModalOpen(false);
    setFormData({ delegatee: '', startDate: '', endDate: '', reason: '' });
  };

  const handleCancel = (id) => {
    setDelegations(delegations.map(d => d.id === id ? { ...d, status: 'Cancelled' } : d));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-8 min-h-screen bg-page">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Approval Delegations
          </h1>
          <p className="text-slate-500 mt-2">Temporarily assign your approval responsibilities to another user.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          Delegate Approvals
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Delegation ID</th>
                <th className="px-6 py-4">Delegator & Delegatee</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading delegations...</td></tr>
              ) : delegations.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No delegations found.</td></tr>
              ) : delegations.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{del.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">{del.delegator}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span className="font-bold text-slate-700">{del.delegatee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      {del.startDate} <span className="text-slate-300">to</span> {del.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{del.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(del.status)}`}>
                      {del.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {del.status === 'Active' ? (
                      <button 
                        onClick={() => handleCancel(del.id)} 
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 justify-end ml-auto"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Delegation</h2>
              
              <form onSubmit={handleCreate} className="space-y-5">
                <ErrorMessage message={error} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Delegate To (User)</label>
                  <select className="input w-full" required value={formData.delegatee} onChange={e => setFormData({...formData, delegatee: e.target.value})}>
                    <option value="" disabled>Select a user</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Bob Brown">Bob Brown</option>
                    <option value="Alice Johnson">Alice Johnson</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                    <input type="date" className="input w-full" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                    <input type="date" className="input w-full" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
                  <textarea className="input w-full" placeholder="e.g. Annual Leave, Medical Leave" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Delegate</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApprovalDelegations;
