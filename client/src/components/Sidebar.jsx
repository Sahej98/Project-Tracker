import { useAuth } from "../contexts/AuthContext";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Folders,
  UserCog,
  Users,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();

  const dashboardRoute = role ? `/${role}` : "/";

  const isActive = (routes) =>
    routes.some((route) => location.pathname.startsWith(route));

  // Base nav items (for all roles)
  const navItems = [
    {
      to: dashboardRoute,
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      match: [dashboardRoute],
    },
    {
      to: "/projects",
      icon: <Folders size={18} />,
      label: "Projects",
      match: [
        "/projects",
        "/display-project",
        "/add-project",
        "/edit-project",
        "/add-task",
      ],
    },
  ];

  // Show "Today Tasks" to everyone except client
  if (role && role !== "client") {
    navItems.push({
      to: "/today-tasks",
      icon: <CheckCircle size={18} />,
      label: role === "employee" ? "My Tasks" : "Employee Tasks",
      match: ["/today-tasks"],
    });
  }

  if (role === "admin" || role === "manager") {
    navItems.push({
      to: "/reports",
      icon: <CheckCircle size={18} />,
      label: "Reports",
      match: ["/reports"],
    });
  }

  // Admin-only nav items
  if (role === "admin") {
    navItems.push(
      {
        to: "/display-managers",
        icon: <UserCog size={18} />,
        label: "Managers",
        match: [
          "/managers",
          "/display-manager",
          "/add-manager",
          "/edit-manager",
        ],
      },
      {
        to: "/display-employees",
        icon: <Users size={18} />,
        label: "Employees",
        match: [
          "/employees",
          "/display-employee",
          "/add-employee",
          "/edit-employee",
        ],
      },
      {
        to: "/display-clients",
        icon: <Briefcase size={18} />,
        label: "Clients",
        match: ["/clients", "/display-client", "/add-client", "/edit-client"],
      }
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="d-none d-md-flex flex-column position-fixed top-0 start-0 vh-100 bg-light border-end p-3"
        style={{ width: "220px", zIndex: 1030 }}
      >
        <h4 className="mb-4 text-primary">Project Tracker</h4>
        <nav className="nav flex-column gap-2 flex-grow-1">
          {navItems.map(({ to, icon, label, match }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive: defaultIsActive }) =>
                isActive(match) || defaultIsActive
                  ? "nav-link active d-flex align-items-center"
                  : "nav-link d-flex align-items-center text-dark"
              }
            >
              {icon}
              <span className="ms-2">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-3 border-top">
          <button
            onClick={handleLogout}
            className="btn btn-outline-secondary w-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Offcanvas Sidebar */}
      {isOpen && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={closeSidebar}
          style={{ zIndex: 1040 }}
        ></div>
      )}
      <div
        className={`offcanvas offcanvas-start ${isOpen ? "show" : ""}`}
        style={{
          visibility: isOpen ? "visible" : "hidden",
          zIndex: 1045,
          width: "220px",
        }}
        tabIndex="-1"
        aria-labelledby="sidebarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="sidebarLabel">
            Menu
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeSidebar}
          ></button>
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <nav className="nav flex-column gap-2 flex-grow-1">
            {navItems.map(({ to, icon, label, match }) => (
              <NavLink
                key={label}
                to={to}
                onClick={closeSidebar}
                className={({ isActive: defaultIsActive }) =>
                  isActive(match) || defaultIsActive
                    ? "nav-link active d-flex align-items-center"
                    : "nav-link d-flex align-items-center text-dark"
                }
              >
                {icon}
                <span className="ms-2">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-3 border-top">
            <button
              onClick={() => {
                closeSidebar();
                handleLogout();
              }}
              className="btn btn-outline-danger w-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
