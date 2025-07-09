import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

export default function ClientPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/users");
        setClients(res.data.clients || []);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openClientDetails = (id) => {
    navigate(`/display-client/${id}`);
  };

  return (
    <div className="container-fluid py-3 px-1 px-md-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-semibold text-dark mb-3">Clients</h2>

        <div className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search clients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-8 text-md-end">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/add-client")}
            >
              + Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <p className="text-muted text-center">No clients found.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredClients.map((client) => (
            <div
              key={client._id}
              className="d-flex card shadow flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3 rounded shadow-sm bg-white hover-shadow transition"
              style={{ cursor: "pointer" }}
              onClick={() => openClientDetails(client._id)}
            >
              <div className="mb-2 mb-md-0">
                <h5 className="mb-1">{client.fullname}</h5>
                <p className="mb-0 text-muted small">
                  {client.email || "No email provided"}
                </p>
              </div>
              <span
                className={`badge bg-${
                  client.status === "active" ? "success" : "secondary"
                } px-3 py-2 text-capitalize`}
              >
                {client.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
