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

  if (!manager) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">Loading manager details...</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header">
          <h4 className="mb-0">Manager Information</h4>
        </div>
        <div className="card-body">
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Full Name:</label>
            <div className="col-sm-10">{manager.fullname}</div>
          </div>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Username:</label>
            <div className="col-sm-10">{manager.username}</div>
          </div>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Email:</label>
            <div className="col-sm-10">{manager.email}</div>
          </div>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Status:</label>
            <div className="col-sm-10">
              <span
                className={`badge ${
                  manager.status === "active" ? "bg-success" : "bg-secondary"
                }`}
              >
                {manager.status || "active"}
              </span>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex gap-2 justify-content-end">
          <button className="btn btn-warning" onClick={handleEdit}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
