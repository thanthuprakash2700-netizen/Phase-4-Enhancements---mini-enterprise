import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { Bell, X, CheckCircle2, AlertCircle } from 'lucide-react';

const NotificationsToast = () => {
  const { lastMessage } = useWebSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NOTIFICATION_NEW') {
      const newNotif = {
        id: Date.now(),
        message: lastMessage.message,
        // Optional: determine type based on message content
        type: lastMessage.message.toLowerCase().includes('completed') ? 'success' : 
              lastMessage.message.toLowerCase().includes('assigned') ? 'info' : 'default'
      };
      setNotifications((prev) => [...prev, newNotif]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    }
  }, [lastMessage]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'info': return <AlertCircle size={20} className="text-blue-500" />;
      default: return <Bell size={20} className="text-primary" />;
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'success': return 'bg-emerald-50';
      case 'info': return 'bg-blue-50';
      default: return 'bg-primary/10';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white backdrop-blur-xl shadow-2xl shadow-slate-200/50 border border-slate-100 rounded-2xl p-4 flex items-start gap-4 w-96 relative overflow-hidden group"
          >
            {/* Progress bar animation for timeout */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 origin-left w-full ${notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'info' ? 'bg-blue-500' : 'bg-primary'}`}
            />
            
            <div className={`p-2.5 rounded-xl shrink-0 ${getBg(notif.type)}`}>
              {getIcon(notif.type)}
            </div>
            
            <div className="flex-1 pt-1">
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {notif.type === 'success' ? 'Success' : notif.type === 'info' ? 'New Assignment' : 'Notification'}
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {notif.message}
              </p>
            </div>
            
            <button 
              onClick={() => removeNotification(notif.id)}
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsToast;
