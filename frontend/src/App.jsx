import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddTransaction = lazy(() => import("./pages/AddTransaction"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Reports = lazy(() => import("./pages/Reports"));
const AIInsights = lazy(() => import("./pages/AIInsights"));
const EditTransaction = lazy(() => import("./pages/EditTransaction"));
const Budget = lazy(() => import("./pages/Budget"));
const Recurring = lazy(() => import("./pages/Recurring"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SavingGoals = lazy(() => import("./pages/SavingGoals"));

function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/forgot-password"
          element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/reset-password/:token"
          element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-transaction"
          element={
            <ProtectedRoute>
              <AddTransaction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-transaction/:id"
          element={
            <ProtectedRoute>
              <EditTransaction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
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

        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AIInsights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recurring"
          element={
            <ProtectedRoute>
              <Recurring />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saving-goals"
          element={
            <ProtectedRoute>
              <SavingGoals />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
