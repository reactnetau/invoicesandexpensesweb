import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Auth pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ConfirmSignupPage } from './pages/ConfirmSignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// App pages
import { DashboardPage } from './pages/DashboardPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ClientsPage } from './pages/ClientsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountPage } from './pages/AccountPage';
import { SnapshotPage } from './pages/SnapshotPage';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { PublicInvoicePage } from './pages/PublicInvoicePage';
import { DeleteAccountPage } from './pages/DeleteAccountPage';
import { SupportPage } from './pages/SupportPage';
import { StripeSuccessPage } from './pages/StripeSuccessPage';
import { StripeCancelPage } from './pages/StripeCancelPage';

import { LoadingSpinner } from './components/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Marketing */}
      <Route path="/" element={<LandingPage />} />

      {/* Public invoice — no auth required */}
      <Route path="/invoice/:publicId" element={<PublicInvoicePage />} />

      {/* Public utility pages */}
      <Route path="/delete-account" element={<DeleteAccountPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/stripe-success" element={<StripeSuccessPage />} />
      <Route path="/stripe-cancel" element={<StripeCancelPage />} />

      {/* Auth flow — guests only */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path="/signup" element={<GuestOnlyRoute><SignupPage /></GuestOnlyRoute>} />
        <Route path="/confirm" element={<ConfirmSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* App — authenticated */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/snapshot" element={<SnapshotPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
