import { useAuth } from "../contexts/AuthContext";
import "../styles/others/Navbar.css";

export default function Navbar({ title = "Dashboard" }) {
  const { role } = useAuth();

  return (
    <div className="navbar">
      <h3>{title}</h3>
      <div className="pfp">
        <form><input type="text" />
        </form>
        <img src="" alt="" />
      </div>
    </div>
  );
}
