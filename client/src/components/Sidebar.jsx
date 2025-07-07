import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <h2>Project Tracker</h2>
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/">Projects</Link>
        </nav>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
