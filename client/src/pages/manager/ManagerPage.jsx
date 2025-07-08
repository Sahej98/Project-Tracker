import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import "../../styles/manager/ManagerPage.css";

export default function ManagerPage() {
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/users");
        setManagers(res.data.managers || []);
      } catch (err) {
        console.error("Failed to fetch managers", err);
      }
    };
    fetchManagers();
  }, []);

  const openManagerDetails = (id) => {
    navigate(`/display-manager/${id}`);
  };

  const filteredManagers = managers.filter(manager =>
    manager.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manager-page">
      <div className="top-bar">
        <h2>Managers</h2>
        <div className="top-actions">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-btn" onClick={() => navigate("/add-manager")}>
            + Add Manager
          </button>
        </div>
      </div>

      <div className="manager-list">
        {filteredManagers.map((manager) => (
          <div
            key={manager._id}
            className="manager-card"
            onClick={() => openManagerDetails(manager._id)}
          >
            <h4>{manager.fullname}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
