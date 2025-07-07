import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") navigate("/admin");
    else if (role === "manager") navigate("/manager");
    else if (role === "employee") navigate("/employee");
    else if (role === "client") navigate("/client");
  }, [role]);

  return (
      <div className="container" style={{ marginLeft: "220px" }}>
        <p>Redirecting to your dashboard...</p>
      </div>
  );
}
