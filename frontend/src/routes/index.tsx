import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import NotePage from "../pages/NotePage";
import AdminPage from "../pages/AdminPage";
import LandingPage from "../pages/LandingPage";
import SharedNotePage from "../pages/SharedNotePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/note/:id",
    element: (
      <ProtectedRoute>
        <NotePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/note/:id/edit",
    element: (
      <ProtectedRoute>
        <NotePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shared/:shareToken",
    element: <SharedNotePage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
