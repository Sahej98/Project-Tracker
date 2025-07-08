import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;

    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "manager":
        navigate("/manager");
        break;
      case "employee":
        navigate("/employee");
        break;
      case "client":
        navigate("/client");
        break;
      default:
        navigate("/login");
    }
  }, [role, navigate]);

  return (
    <div className="container">
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
