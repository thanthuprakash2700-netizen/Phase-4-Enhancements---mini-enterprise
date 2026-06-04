import React, { useState, useEffect } from 'react';
import { Settings, BellRing, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPreferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [prefs, setPrefs] = useState({
    inApp: true,
    email: false,
    tasks: true,
    approvals: true,
    escalations: true,
    documents: false
  });

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="flex items-start justify-between py-5 border-b border-slate-100 last:border-0">
      <div className="pr-8">
        <h4 className="font-semibold text-slate-800 text-sm mb-1">{label}</h4>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-slate-500">Loading preferences...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-page">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="text-primary" size={32} />
          Notification Preferences
        </h1>
        <p className="text-slate-500 mt-2">Customize how and when you want to receive alerts.</p>
      </header>

      <form onSubmit={handleSave} className="max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Delivery Channels</h2>
              <p className="text-xs text-slate-500">Choose where you receive notifications</p>
            </div>
          </div>
          <div className="px-6">
            <ToggleSwitch 
              label="In-App Notifications" 
              description="Receive notifications within the TaskFlow web application."
              checked={prefs.inApp}
              onChange={(e) => setPrefs({...prefs, inApp: e.target.checked})}
            />
            <ToggleSwitch 
              label="Email Notifications" 
              description="Receive summary and critical alerts directly to your email."
              checked={prefs.email}
              onChange={(e) => setPrefs({...prefs, email: e.target.checked})}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Notification Types</h2>
              <p className="text-xs text-slate-500">Choose what events you want to be notified about</p>
            </div>
          </div>
          <div className="px-6">
            <ToggleSwitch 
              label="Tasks" 
              description="Updates when tasks are assigned to you or their status changes."
              checked={prefs.tasks}
              onChange={(e) => setPrefs({...prefs, tasks: e.target.checked})}
            />
            <ToggleSwitch 
              label="Approvals" 
              description="Alerts for new approval requests, or decisions on your requests."
              checked={prefs.approvals}
              onChange={(e) => setPrefs({...prefs, approvals: e.target.checked})}
            />
            <ToggleSwitch 
              label="Escalations & SLAs" 
              description="Critical alerts when an SLA is breached or an approval is escalated."
              checked={prefs.escalations}
              onChange={(e) => setPrefs({...prefs, escalations: e.target.checked})}
            />
            <ToggleSwitch 
              label="Documents" 
              description="Notifications when documents are shared with you or updated."
              checked={prefs.documents}
              onChange={(e) => setPrefs({...prefs, documents: e.target.checked})}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            type="submit" 
            className="btn-primary px-8 py-3 flex items-center gap-2 relative overflow-hidden"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          
          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-emerald-600 font-medium text-sm"
              >
                <CheckCircle size={18} />
                Preferences saved successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;
