import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

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

  const filteredManagers = managers.filter((manager) =>
    manager.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openManagerDetails = (id) => {
    navigate(`/display-manager/${id}`);
  };

  return (
    <div className="container-fluid py-3 px-1 px-md-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-semibold text-dark mb-3">Managers</h2>

        <div className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search managers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-8 text-md-end">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/add-manager")}
            >
              + Add Manager
            </button>
          </div>
        </div>
      </div>

      {/* Managers List */}
      {filteredManagers.length === 0 ? (
        <p className="text-muted text-center">No managers found.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredManagers.map((manager) => (
            <div
              key={manager._id}
              className="d-flex card shadow flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3 rounded shadow-sm bg-white hover-shadow transition"
              style={{ cursor: "pointer" }}
              onClick={() => openManagerDetails(manager._id)}
            >
              <div className="mb-2 mb-md-0">
                <h5 className="mb-1">{manager.fullname}</h5>
                <p className="mb-0 text-muted small">
                  {manager.email || "No email provided"}
                </p>
              </div>
              <span
                className={`badge bg-${
                  manager.status === "active" ? "success" : "secondary"
                } px-3 py-2 text-capitalize`}
              >
                {manager.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
