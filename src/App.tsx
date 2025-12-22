import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import SchedulePage from './pages/SchedulePage';
import LiveClassPage from './pages/LiveClassPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Dashboard Routes (With Sidebar) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="schedule" element={<SchedulePage />} />
            {/* REMOVED "live" FROM HERE */}
          </Route>

          {/* [FIX] MOVED "live" OUTSIDE DASHBOARD 
             This makes it accessible at "/live" and gives it Full Screen 
          */}
          <Route 
            path="/live" 
            element={
              <ProtectedRoute>
                <LiveClassPage />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;