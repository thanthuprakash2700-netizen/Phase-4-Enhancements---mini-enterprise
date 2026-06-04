import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PageHeader from '../components/common/PageHeader';
import FilterBar from '../components/common/FilterBar';
import DateRangeFilter from '../components/common/DateRangeFilter';
import UserSelectDropdown from '../components/common/UserSelectDropdown';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (['admin', 'auditor'].includes(user?.role)) {
      fetchLogs();
    }
  }, [user, selectedUser, selectedModule, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let endpoint = '/audit-logs/';
      let params = {};

      if (selectedUser) {
        endpoint = `/audit-logs/user/${selectedUser}`;
      } else if (selectedModule) {
        endpoint = `/audit-logs/module/${selectedModule}`;
      } else if (startDate && endDate) {
        endpoint = `/audit-logs/date-range`;
        params = { start_date: new Date(startDate).toISOString(), end_date: new Date(endDate).toISOString() };
      }

      const res = await api.get(endpoint, { params });
      setLogs(res.data.items || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!['admin', 'auditor'].includes(user?.role)) {
    return <div className="p-8">Not authorized</div>;
  }

  const columns = [
    { header: 'Log ID', accessor: (log) => <span className="font-mono text-xs text-slate-500">#{log.id}</span> },
    { header: 'User', accessor: (log) => log.user_id || 'System' },
    { header: 'Module', accessor: (log) => log.module_name || log.entity },
    { header: 'Action Type', accessor: (log) => <StatusBadge status={log.action_type || log.action} /> },
    { header: 'Record ID', accessor: (log) => log.record_id || log.entity_id || '-' },
    { header: 'IP Address', accessor: (log) => log.ip_address || '-' },
    { header: 'Created At', accessor: (log) => new Date(log.timestamp).toLocaleString() },
    { 
      header: 'Actions', 
      accessor: (log) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye size={18} />
        </button>
      )
    },
  ];

  const clearFilters = () => {
    setSelectedUser('');
    setSelectedModule('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Audit Logs" 
        subtitle="Monitor detailed backend activity, data changes, and system events."
        icon={Activity}
      />

      <FilterBar>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</label>
          <select 
            value={selectedModule} 
            onChange={(e) => { setSelectedModule(e.target.value); setSelectedUser(''); setStartDate(''); setEndDate(''); }}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none transition-all"
          >
            <option value="">All Modules</option>
            <option value="Tasks">Tasks</option>
            <option value="Approvals">Approvals</option>
            <option value="SLA">SLA</option>
            <option value="Notifications">Notifications</option>
            <option value="Users">Users</option>
          </select>
        </div>
        
        <div onClick={() => { setSelectedModule(''); setStartDate(''); setEndDate(''); }}>
          <UserSelectDropdown value={selectedUser} onChange={setSelectedUser} />
        </div>

        <div onClick={() => { setSelectedUser(''); setSelectedModule(''); }}>
          <DateRangeFilter 
            startDate={startDate} 
            endDate={endDate} 
            onStartDateChange={setStartDate} 
            onEndDateChange={setEndDate} 
          />
        </div>

        {(selectedUser || selectedModule || (startDate && endDate)) && (
          <button 
            onClick={clearFilters}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </FilterBar>

      <DataTable 
        columns={columns} 
        data={logs} 
        loading={loading}
        onRowClick={(row) => setSelectedLog(row)}
        emptyStateProps={{
          title: "No audit logs found",
          message: "Try adjusting your filters to see more results."
        }}
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-500" />
                  Audit Log Details
                </h3>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Timestamp</p>
                    <p className="text-sm font-medium text-slate-800">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">IP Address</p>
                    <p className="text-sm font-medium text-slate-800">{selectedLog.ip_address || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">User Agent</p>
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{selectedLog.user_agent || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Old Data</h4>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 overflow-x-auto">
                      {selectedLog.old_data ? (
                        <pre className="text-xs text-rose-800 font-mono">{JSON.stringify(selectedLog.old_data, null, 2)}</pre>
                      ) : (
                        <p className="text-sm text-rose-400 italic">No previous data.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">New Data</h4>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 overflow-x-auto">
                      {selectedLog.new_data || selectedLog.details ? (
                        <pre className="text-xs text-emerald-800 font-mono">{JSON.stringify(selectedLog.new_data || selectedLog.details, null, 2)}</pre>
                      ) : (
                        <p className="text-sm text-emerald-400 italic">No new data.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLogs;
