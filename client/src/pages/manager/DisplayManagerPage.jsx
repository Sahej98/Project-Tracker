import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import "../../styles/manager/DisplayManagerPage.css";

export default function DisplayManagerPage() {
  const { id } = useParams();
  const [manager, setManager] = useState(null);
  const navigate = useNavigate();

  const fetchManager = async () => {
    try {
      const res = await api.get("/users");
      const foundManager = res.data.managers.find((m) => m._id === id);
      if (foundManager) {
        setManager(foundManager);
      } else {
        console.error("Manager not found");
      }
    } catch (err) {
      console.error("Error fetching manager", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      try {
        await api.delete(`/users/${id}`);
        navigate("/display-managers");
      } catch (err) {
        console.error("Failed to delete manager", err);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-manager/${id}`);
  };

  useEffect(() => {
    fetchManager();
  }, []);

  if (!manager) return <p className="loading">Loading manager details...</p>;

  return (
    <div className="display-manager-container">
      <div className="display-manager-card">
        <h2 className="card-title">Manager Information</h2>
        <div className="card-body">
          <div className="info-row">
            <span className="label">Full Name:</span>
            <span className="value">{manager.fullname}</span>
          </div>
          <div className="info-row">
            <span className="label">Username:</span>
            <span className="value">{manager.username}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{manager.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className={`value ${manager.status}`}>{manager.status || "active"}</span>
          </div>
        </div>
        <div className="action-buttons">
          <button className="edit-btn" onClick={handleEdit}>Edit</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
