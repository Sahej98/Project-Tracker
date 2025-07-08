import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import "../../styles/manager/ManagerForm.css";

export default function EditManagerPage() {
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
    async function fetchManager() {
      try {
        const res = await api.get("/users");
        const manager = res.data.managers.find((m) => m._id === id);
        if (manager) {
          setFormData({
            fullname: manager.fullname,
            username: manager.username,
            email: manager.email,
            password: "",
            status: manager.status || "active",
          });
        } else {
          console.error("Manager not found");
        }
      } catch (err) {
        console.error("Failed to load manager", err);
      }
    }
    fetchManager();
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${id}`, { ...formData, role: "manager" });
      navigate("/display-managers");
    } catch (err) {
      console.error("Failed to update manager", err);
    }
  };

  return (
    <div className="manager-form-page">
      <h2>Edit Manager</h2>
      <form onSubmit={handleSubmit} className="manager-form">
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
          <button type="submit">Update Manager</button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/display-managers")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
