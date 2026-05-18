import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import KPIs from './pages/KPIs';
import DataImport from './pages/DataImport';
import Reports from './pages/Reports';
import { Activity } from 'lucide-react';

// Guarded Route component to lock down dashboard views
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center justify-center gap-4">
        <div className="bg-brand-primary/10 border border-brand-primary/20 p-5 rounded-2xl animate-pulse">
          <Activity className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
        <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase animate-pulse">
          Restoring Security Session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Redirect logged-in users away from auth forms
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Access */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Secure Workspace */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/kpis" 
            element={
              <ProtectedRoute>
                <KPIs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/import" 
            element={
              <ProtectedRoute>
                <DataImport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
