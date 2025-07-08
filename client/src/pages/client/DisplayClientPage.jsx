import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import "../../styles/client/DisplayClientPage.css";

export default function DisplayClientPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  const fetchClient = async () => {
    try {
      const res = await api.get("/users");
      const foundClient = res.data.clients.find((c) => c._id === id);
      if (foundClient) {
        setClient(foundClient);
      } else {
        console.error("Client not found");
      }
    } catch (err) {
      console.error("Error fetching client", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await api.delete(`/users/${id}`);
        navigate("/display-clients");
      } catch (err) {
        console.error("Failed to delete client", err);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-client/${id}`);
  };

  useEffect(() => {
    fetchClient();
  }, []);

  if (!client) return <p className="loading">Loading client details...</p>;

  return (
    <div className="display-client-container">
      <div className="display-client-card">
        <h2 className="card-title">Client Information</h2>
        <div className="card-body">
          <div className="info-row">
            <span className="label">Full Name:</span>
            <span className="value">{client.fullname}</span>
          </div>
          <div className="info-row">
            <span className="label">Username:</span>
            <span className="value">{client.username}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{client.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className={`value ${client.status}`}>{client.status || "active"}</span>
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
