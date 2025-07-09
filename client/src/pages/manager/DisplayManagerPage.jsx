import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function DisplayManagerPage() {
  const { id } = useParams();
  const [manager, setManager] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const res = await api.get("/users");
        const foundManager = res.data.managers.find((c) => c._id === id);
        if (foundManager) {
          setManager(foundManager);
        } else {
          console.error("Manager not found");
        }
      } catch (err) {
        console.error("Error fetching manager", err);
      }
    };
    fetchManager();
  }, [id]);

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

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  if (!manager) {
    return (
      <div className="container mt-4">
        <p>Loading manager details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2" style={{ backgroundColor: "#f8f9fa"}}>
      <div className="bg-white shadow-sm rounded-4 p-4 w-100 card shadow">
        <h3 className="mb-4 border-bottom pb-2">Manager Details</h3>

        <DetailRow label="Full Name" value={manager.fullname} />
        <DetailRow label="Username" value={manager.username} />
        <DetailRow label="Email" value={manager.email || "N/A"} />
        <DetailRow
          label="Status"
          value={
            <span className={`badge px-3 py-1 bg-${manager.status === "active" ? "success" : "secondary"}`}>
              {manager.status}
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
    <div className="row mb-3">
      <div className="col-sm-6 text-start">
        <small className="text-muted">{label}</small>
      </div>
      <div className="col-sm-6 text-end fw-semibold text-dark">
        {value}
      </div>
    </div>
  );
}
