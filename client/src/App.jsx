import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import ManagerPage from "./pages/ManagerPage";
import EmployeePage from "./pages/EmployeePage";
import ClientPage from "./pages/ClientPage";
import ProjectsPage from "./pages/ProjectsPage";
import AddProjectPage from "./pages/AddProjectPage";

import { useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/MainLayout";

function App() {
  const { token } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All protected routes with sidebar layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <MainLayout><AdminPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/manager" element={
          <ProtectedRoute>
            <MainLayout><ManagerPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/employee" element={
          <ProtectedRoute>
            <MainLayout><EmployeePage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/client" element={
          <ProtectedRoute>
            <MainLayout><ClientPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <MainLayout><ProjectsPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-project" element={
          <ProtectedRoute>
            <MainLayout><AddProjectPage /></MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
