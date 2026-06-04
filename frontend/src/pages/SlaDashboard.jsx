import React, { useState, useEffect } from 'react';
import { Gauge, Clock, AlertTriangle, CheckCircle, ShieldAlert, Filter, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SlaDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [slaData, setSlaData] = useState([]);

  useEffect(() => {
    // Fetch mock data
    setTimeout(() => {
      setSlaData([
        { id: 'REC-101', module: 'Task', recordId: 'TSK-550', status: 'ACTIVE', startTime: '2023-10-25 10:00 AM', dueTime: '2023-10-26 10:00 AM', completedTime: '-', breachReason: '-', escalated: false },
        { id: 'REC-102', module: 'Approval', recordId: 'APP-892', status: 'BREACHED', startTime: '2023-10-24 09:00 AM', dueTime: '2023-10-24 09:00 PM', completedTime: '-', breachReason: 'Approver on leave', escalated: true },
        { id: 'REC-103', module: 'Task', recordId: 'TSK-551', status: 'COMPLETED_WITHIN_SLA', startTime: '2023-10-23 11:00 AM', dueTime: '2023-10-24 11:00 AM', completedTime: '2023-10-23 04:30 PM', breachReason: '-', escalated: false },
        { id: 'REC-104', module: 'Approval', recordId: 'APP-893', status: 'ESCALATED', startTime: '2023-10-22 08:00 AM', dueTime: '2023-10-22 08:00 PM', completedTime: '-', breachReason: 'Ignored notification', escalated: true },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const stats = {
    active: slaData.filter(d => d.status === 'ACTIVE').length,
    breached: slaData.filter(d => d.status === 'BREACHED').length,
    completed: slaData.filter(d => d.status === 'COMPLETED_WITHIN_SLA').length,
    escalated: slaData.filter(d => d.status === 'ESCALATED' || d.escalated).length,
  };

  const filteredData = slaData.filter(d => {
    return (moduleFilter === 'All' || d.module === moduleFilter) &&
           (statusFilter === 'All' || d.status === statusFilter || (statusFilter === 'ESCALATED' && d.escalated));
  });

  const getStatusBadge = (status, escalated) => {
    if (escalated || status === 'ESCALATED') return 'bg-orange-50 text-orange-600 border-orange-200';
    switch (status) {
      case 'ACTIVE': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'BREACHED': return 'bg-red-50 text-red-600 border-red-200';
      case 'COMPLETED_WITHIN_SLA': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="p-8 min-h-screen bg-page">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Gauge className="text-primary" size={32} />
          SLA & Workflow Monitoring
        </h1>
        <p className="text-slate-500 mt-2">Track real-time SLA metrics, breaches, and escalations.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active SLAs</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Breached SLAs</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.breached}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed in SLA</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.completed}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Escalated</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.escalated}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 mb-6 items-center">
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
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED_WITHIN_SLA">Completed</option>
          <option value="BREACHED">Breached</option>
          <option value="ESCALATED">Escalated</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Activity className="text-slate-400" size={20} />
          <h2 className="font-bold text-slate-800 text-lg">SLA Tracking Records</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Record ID</th>
                <th className="px-6 py-4">SLA Status</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">Due Time</th>
                <th className="px-6 py-4">Completed Time</th>
                <th className="px-6 py-4">Breach Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">Loading SLA data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">No records found matching filters.</td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{record.module}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{record.recordId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getStatusBadge(record.status, record.escalated)}`}>
                        {record.escalated ? 'ESCALATED' : formatStatus(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{record.startTime}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 text-xs">{record.dueTime}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{record.completedTime}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]">{record.breachReason}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={record.module === 'Task' ? `/tasks/${record.recordId}` : `/approvals/${record.recordId}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SlaDashboard;
