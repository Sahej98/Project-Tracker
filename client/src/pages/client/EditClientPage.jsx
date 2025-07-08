import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import "../../styles/client/ClientForm.css";

export default function EditClientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    status: "active",
  });

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await api.get("/users");
        const client = res.data.clients.find((c) => c._id === id);
        if (client) {
          setFormData({
            fullname: client.fullname,
            username: client.username,
            email: client.email,
            password: "",
            status: client.status || "active",
          });
        } else {
          console.error("Client not found");
        }
      } catch (err) {
        console.error("Failed to load client", err);
      }
    }
    fetchClient();
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${id}`, { ...formData, role: "client" });
      navigate("/display-clients");
    } catch (err) {
      console.error("Failed to update client", err);
    }
  };

  return (
    <div className="client-form-page">
      <h2>Edit Client</h2>
      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-row">
          <input
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="New Password (leave blank to keep current)"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit">Update Client</button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/display-clients")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
