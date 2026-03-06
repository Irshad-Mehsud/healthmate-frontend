import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthWrapper from "./components/AuthWrapper";

import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Siginup";
import ReportAnalysis from "./pages/ReportAnalysis";
import Settings from "./pages/Settings";
import Timeline from "./components/Timeline";

// Component to handle redirects based on auth state
const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-lg text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes - redirect to dashboard if already logged in */}
      <Route path="/login" element={
        <AuthRedirect>
          <Login />
        </AuthRedirect>
      } />
      <Route path="/signup" element={
        <AuthRedirect>
          <Signup />
        </AuthRedirect>
      } />

      {/* Protected Routes */}
      <Route element={
        <AuthWrapper>
          <MainLayout />
        </AuthWrapper>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis" element={<ReportAnalysis />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/timeline" element={<Timeline />} />
      </Route>

      {/* Default Route */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;