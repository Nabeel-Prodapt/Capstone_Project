import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import AlertsExpiryView from './components/AlertsExpiryView';
import DeviceInventory from './components/DeviceInventory';
import './styles/themes.css';
import './App.css';
import LicenseRepository from './components/LicenseRepository';
import Assignments from './components/Assignments';
import ProtectedRoute from './components/ProtectedRoute';
import AuditLogs from './components/AuditLogs';

function App() {
  return (
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/alerts-expiry" element={<AlertsExpiryView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devices" element={<DeviceInventory />} />
        <Route path="/licenses" element={<LicenseRepository />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  </>
  );
}

export default App;