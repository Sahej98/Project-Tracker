import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import MainLayout from "./components/MainLayout";

// Auth Pages
import Login from "./pages/others/Login";
import Register from "./pages/others/Register";

// Dashboards
import Dashboard from "./pages/others/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";

// Project Pages
import ProjectsPage from "./pages/project/ProjectsPage";
import AddProjectPage from "./pages/project/AddProjectPage";
import EditProjectPage from "./pages/project/EditProjectPage";
import DisplayProjectPage from "./pages/project/DisplayProjectPage";

// Client Pages
import ClientPage from "./pages/client/ClientPage";
import AddClientPage from "./pages/client/AddClientPage";
import EditClientPage from "./pages/client/EditClientPage";
import DisplayClientPage from "./pages/client/DisplayClientPage";

// Employee Pages
import EmployeePage from "./pages/employee/EmployeePage";
import AddEmployeePage from "./pages/employee/AddEmployeePage";
import EditEmployeePage from "./pages/employee/EditEmployeePage";
import DisplayEmployeePage from "./pages/employee/DisplayEmployeePage";

// Manager Pages
import ManagerPage from "./pages/manager/ManagerPage";
import AddManagerPage from "./pages/manager/AddManagerPage";
import EditManagerPage from "./pages/manager/EditManagerPage";
import DisplayManagerPage from "./pages/manager/DisplayManagerPage";

function App() {
  const { token } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Dashboards by Role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ManagerDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EmployeeDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Project Management */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/display-project/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DisplayProjectPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-project"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddProjectPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-project/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditProjectPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Client Management */}
          <Route
            path="/display-clients"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-client"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddClientPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-client/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditClientPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/display-client/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DisplayClientPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Employee Management */}
          <Route
            path="/display-employees"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EmployeePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-employee"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddEmployeePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-employee/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditEmployeePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/display-employee/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DisplayEmployeePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Manager Management */}
          <Route
            path="/display-managers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ManagerPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-manager"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddManagerPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-manager/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditManagerPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/display-manager/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DisplayManagerPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
