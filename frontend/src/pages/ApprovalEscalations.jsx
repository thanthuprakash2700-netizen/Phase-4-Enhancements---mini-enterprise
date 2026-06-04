import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Plus, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from '../components/common/ErrorMessage';

const ApprovalEscalations = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  
  // Dummy form states
  const [selectedApproval, setSelectedApproval] = useState('');
  const [escalateTo, setEscalateTo] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setEscalations([
        { id: 'ESC-001', approvalId: 'APP-892', escalatedFrom: 'Sarah Jenkins', escalatedTo: 'John Manager', reason: 'Approver on leave', level: 1, status: 'Pending', escalatedAt: '2023-10-24 09:30 AM' },
        { id: 'ESC-002', approvalId: 'APP-750', escalatedFrom: 'Mike Ross', escalatedTo: 'Harvey Specter', reason: 'SLA Breached > 24hrs', level: 2, status: 'Resolved', escalatedAt: '2023-10-22 10:00 AM' },
        { id: 'ESC-003', approvalId: 'APP-901', escalatedFrom: 'Rachel Zane', escalatedTo: 'Louis Litt', reason: 'High Priority Request', level: 1, status: 'Cancelled', escalatedAt: '2023-10-21 02:15 PM' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  const handleResolve = (id) => {
    setEscalations(escalations.map(e => e.id === id ? { ...e, status: 'Resolved' } : e));
  };

  const handleCancel = (id) => {
    setEscalations(escalations.map(e => e.id === id ? { ...e, status: 'Cancelled' } : e));
  };

  const handleManualEscalate = (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedApproval) {
      setError("Approval ID is required");
      return;
    }
    if (!escalateTo) {
      setError("Escalate To User must be selected");
      return;
    }
    if (!reason.trim()) {
      setError("Reason is required for escalation");
      return;
    }

    const newEscalation = {
      id: `ESC-00${escalations.length + 1}`,
      approvalId: selectedApproval,
      escalatedFrom: 'System Admin',
      escalatedTo: escalateTo,
      reason: reason,
      level: 1,
      status: 'Pending',
      escalatedAt: new Date().toLocaleString()
    };
    setEscalations([newEscalation, ...escalations]);
    setIsEscalateModalOpen(false);
  };

  return (
    <div className="p-8 min-h-screen bg-page">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-orange-500" size={32} />
            Approval Escalations
          </h1>
          <p className="text-slate-500 mt-2">Manage and track delayed or manually escalated approvals.</p>
        </div>
        <button 
          onClick={() => setIsEscalateModalOpen(true)}
          className="btn bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          Manual Escalation
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Escalation ID</th>
                <th className="px-6 py-4">Approval ID</th>
                <th className="px-6 py-4">Path</th>
                <th className="px-6 py-4">Reason & Level</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500">Loading escalations...</td></tr>
              ) : escalations.map((esc) => (
                <tr key={esc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{esc.id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold">{esc.approvalId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 truncate max-w-[100px]" title={esc.escalatedFrom}>{esc.escalatedFrom}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span className="font-bold text-slate-700 truncate max-w-[100px]" title={esc.escalatedTo}>{esc.escalatedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 font-medium mb-1 truncate max-w-[150px]">{esc.reason}</div>
                    <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Level {esc.level}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{esc.escalatedAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(esc.status)}`}>
                      {esc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {esc.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleResolve(esc.id)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Resolve">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleCancel(esc.id)} className="p-1.5 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" title="Cancel">
                          <XCircle size={16} />
                        </button>
                      </div>
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

      {/* Manual Escalate Modal */}
      <AnimatePresence>
        {isEscalateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEscalateModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Manually Escalate Approval</h2>
              
              <form onSubmit={handleManualEscalate} className="space-y-5">
                <ErrorMessage message={error} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Approval ID</label>
                  <input type="text" className="input w-full" placeholder="e.g. APP-999" required value={selectedApproval} onChange={e => setSelectedApproval(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Escalate To (User)</label>
                  <select className="input w-full" required value={escalateTo} onChange={e => setEscalateTo(e.target.value)}>
                    <option value="" disabled>Select User</option>
                    <option value="John Manager">John Manager</option>
                    <option value="Sarah Director">Sarah Director</option>
                    <option value="Admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Escalation</label>
                  <textarea className="input w-full min-h-[100px]" placeholder="Explain why you are manually escalating..." required value={reason} onChange={e => setReason(e.target.value)}></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsEscalateModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn bg-orange-500 hover:bg-orange-600 text-white flex-1 flex items-center justify-center gap-2">
                    <ShieldAlert size={18} /> Escalate Now
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

export default ApprovalEscalations;
