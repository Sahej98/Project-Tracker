import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

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
    <div className="container mt-5">
      <h2 className="mb-4">Edit Manager</h2>
      <form onSubmit={handleSubmit} className="card shadow-sm p-4">
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <input
              name="fullname"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <input
              name="password"
              type="password"
              placeholder="New Password (leave blank to keep current)"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="mb-3">
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="submit" className="btn btn-success">
            Update Manager
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/display-managers")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
