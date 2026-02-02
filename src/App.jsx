import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PersonalLayout from './layouts/PersonalLayout';
import TuitionLayout from './layouts/TuitionLayout';
import Landing from './pages/Landing/Landing';
import Home from './pages/Home/Home';
import AddTransaction from './pages/AddTransaction/AddTransaction';
import Transactions from './pages/Transactions/Transactions';
import Wallets from './pages/Wallets/Wallets';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Students from './pages/Students/Students';
import StudentDetails from './pages/StudentDetails/StudentDetails';
import AddStudent from './pages/AddStudent/AddStudent';
import Recurring from './pages/Recurring/Recurring';
import AddRecurring from './pages/AddRecurring/AddRecurring';
import TuitionDashboard from './pages/tuition/TuitionDashboard/TuitionDashboard';
import TuitionFees from './pages/tuition/TuitionFees/TuitionFees';

// Redirect component for student details with parameter
function StudentDetailsRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tuition/students/${id}`} replace />;
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>💰</span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (no app shell) */}
        <Route path="/" element={<Landing />} />

        {/* Personal Wallet Routes */}
        <Route element={
          <ProtectedRoute>
            <PersonalLayout />
          </ProtectedRoute>
        }>
          <Route path="/app/home" element={<Home />} />
          <Route path="/app/add" element={<AddTransaction />} />
          <Route path="/app/transactions" element={<Transactions />} />
          <Route path="/app/wallets" element={<Wallets />} />
          <Route path="/app/reports" element={<Reports />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/recurring" element={<Recurring />} />
          <Route path="/app/recurring/add" element={<AddRecurring />} />
        </Route>

        {/* Tuition Center Routes */}
        <Route element={
          <ProtectedRoute>
            <TuitionLayout />
          </ProtectedRoute>
        }>
          <Route path="/tuition/dashboard" element={<TuitionDashboard />} />
          <Route path="/tuition/students" element={<Students />} />
          <Route path="/tuition/students/add" element={<AddStudent />} />
          <Route path="/tuition/students/:id" element={<StudentDetails />} />
          <Route path="/tuition/fees" element={<TuitionFees />} />
          <Route path="/tuition/reports" element={<Reports />} />
          <Route path="/tuition/settings" element={<Settings />} />
        </Route>

        {/* Legacy redirects for backward compatibility */}
        <Route path="/home" element={<Navigate to="/app/home" replace />} />
        <Route path="/transactions" element={<Navigate to="/app/transactions" replace />} />
        <Route path="/add" element={<Navigate to="/app/add" replace />} />
        <Route path="/wallets" element={<Navigate to="/app/wallets" replace />} />
        <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        <Route path="/recurring" element={<Navigate to="/app/recurring" replace />} />
        <Route path="/students" element={<Navigate to="/tuition/students" replace />} />
        <Route path="/students/add" element={<Navigate to="/tuition/students/add" replace />} />
        <Route path="/students/:id" element={<StudentDetailsRedirect />} />

        {/* Default redirects */}
        <Route path="/app" element={<Navigate to="/app/home" replace />} />
        <Route path="/tuition" element={<Navigate to="/tuition/dashboard" replace />} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/app/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
