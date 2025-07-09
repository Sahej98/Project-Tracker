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

  const openManagerDetails = (id) => {
    navigate(`/display-manager/${id}`);
  };

  const filteredManagers = managers.filter((manager) =>
    manager.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h2 className="mb-3 mb-md-0">Managers</h2>
        <div className="d-flex gap-2 w-100 w-md-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-manager")}
          >
            + Add Manager
          </button>
        </div>
      </div>

      <div className="row">
        {filteredManagers.map((manager) => (
          <div key={manager._id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div
              className="card h-100 shadow-sm cursor-pointer"
              role="button"
              onClick={() => openManagerDetails(manager._id)}
            >
              <div className="card-body">
                <h5 className="card-title mb-0">{manager.fullname}</h5>
              </div>
            </div>
          </div>
        ))}
        {filteredManagers.length === 0 && (
          <p className="text-muted">No managers found.</p>
        )}
      </div>
    </div>
  );
}
