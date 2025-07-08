import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import "../../styles/client/ClientPage.css";

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

  const openClientDetails = (id) => {
    navigate(`/display-client/${id}`);
  };

  // Filter clients by name
  const filteredClients = clients.filter(client =>
    client.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="client-page">
      <div className="top-bar">
        <h2>Clients</h2>
        <div className="top-actions">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-btn" onClick={() => navigate("/add-client")}>
            + Add Client
          </button>
        </div>
      </div>

      <div className="client-list">
        {filteredClients.map((client) => (
          <div
            key={client._id}
            className="client-card"
            onClick={() => openClientDetails(client._id)}
          >
            <h4>{client.fullname}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
