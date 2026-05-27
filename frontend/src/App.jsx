import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Kanban from './pages/Kanban';
import Approvals from './pages/Approvals';
import Documents from './pages/Documents';
import AuditLogs from './pages/AuditLogs';
import Unauthorized from './pages/Unauthorized';
import Notifications from './pages/Notifications';
import Billing from './pages/Billing';
import MockStripeCheckout from './pages/MockStripeCheckout';

import MainLayout from './layouts/MainLayout';
import { WebSocketProvider } from './context/WebSocketContext';
import NotificationsToast from './components/NotificationsToast';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/mock-stripe-checkout" element={<MockStripeCheckout />} />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/audit-logs" element={<PrivateRoute roles={['admin']}><AuditLogs /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

const LayoutWrapper = () => {
  return (
    <WebSocketProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <NotificationsToast />
    </WebSocketProvider>
  );
}

export default App;
