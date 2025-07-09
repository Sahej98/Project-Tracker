import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function DisplayClientPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchClient();
  }, [id]);

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

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  if (!client) {
    return (
      <div className="container mt-4">
        <p>Loading client details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2" style={{ backgroundColor: "#f8f9fa"}}>
      <div className="bg-white shadow-sm rounded-4 p-4 w-100 card shadow">
        <h3 className="mb-4 border-bottom pb-2">Client Details</h3>

        <DetailRow label="Full Name" value={client.fullname} />
        <DetailRow label="Username" value={client.username} />
        <DetailRow label="Email" value={client.email || "N/A"} />
        <DetailRow
          label="Status"
          value={
            <span className={`badge px-3 py-1 bg-${client.status === "active" ? "success" : "secondary"}`}>
              {client.status}
            </span>
          }
        />

        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-outline-primary" onClick={handleEdit}>Edit</button>
          <button className="btn btn-outline-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="mb-3">
      <small className="text-muted">{label}</small>
      <div className="fw-semibold text-dark">{value}</div>
    </div>
  );
}
