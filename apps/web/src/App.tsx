import { Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "./stores/auth";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TrackersPage from "./pages/TrackersPage";

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/trackers"
          element={
            isAuthenticated ? <TrackersPage /> : <Navigate to="/login" />
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

export default App;
