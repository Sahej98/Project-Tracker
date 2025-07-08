import { useAuth } from "../contexts/AuthContext";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Folders, UserCog, Users, Briefcase } from "lucide-react";
import "../styles/others/Sidebar.css";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ correctly use it here

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardRoute = role ? `/${role}` : "/";

  const isProjectsActive =
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/display-project") ||
    location.pathname.startsWith("/add-project") ||
    location.pathname.startsWith("/edit-project");

  const isManagersActive =
    location.pathname.startsWith("/manager") ||
    location.pathname.startsWith("/managers") ||
    location.pathname.startsWith("/display-manager") ||
    location.pathname.startsWith("/add-manager") ||
    location.pathname.startsWith("/edit-manager");

  const isEmployeesActive =
    location.pathname.startsWith("/employee") ||
    location.pathname.startsWith("/employees") ||
    location.pathname.startsWith("/display-employee") ||
    location.pathname.startsWith("/add-employee") ||
    location.pathname.startsWith("/edit-employee");

  const isClientsActive =
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/clients") ||
    location.pathname.startsWith("/display-client") ||
    location.pathname.startsWith("/add-client") ||
    location.pathname.startsWith("/edit-client");

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <h2>Project Tracker</h2>
        <nav className="nav-links">
          <NavLink
            to={dashboardRoute}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>

          <NavLink
            to="/projects"
            className={() => (isProjectsActive ? "active" : "")}
          >
            <Folders size={16} /> Projects
          </NavLink>
          <NavLink
            to="/display-managers"
            className={() => (isManagersActive ? "active" : "")}
          >
            <UserCog size={16}/> Managers
          </NavLink>
          <NavLink
            to="/display-employees"
            className={() => (isEmployeesActive ? "active" : "")}
          >
            <Users size={16}/> Employees
          </NavLink>
          <NavLink
            to="/display-clients"
            className={() => (isClientsActive ? "active" : "")}
          >
            <Briefcase size={16}/> Clients
          </NavLink>
        </nav>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
