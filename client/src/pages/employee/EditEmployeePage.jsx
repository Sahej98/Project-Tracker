import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function EditEmployeePage() {
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
    async function fetchEmployee() {
      try {
        const res = await api.get("/users");
        const employee = res.data.employees.find((c) => c._id === id);
        if (employee) {
          setFormData({
            fullname: employee.fullname,
            username: employee.username,
            email: employee.email,
            password: "",
            status: employee.status || "active",
          });
        } else {
          console.error("Employee not found");
        }
      } catch (err) {
        console.error("Failed to load employee", err);
      }
    }
    fetchEmployee();
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${id}`, { ...formData, role: "employee" });
      navigate("/display-employees");
    } catch (err) {
      console.error("Failed to update employee", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Edit Employee</h2>
      <form onSubmit={handleSubmit} className="card shadow p-4">
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Full Name</label>
            <input
              name="fullname"
              className="form-control"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Username</label>
            <input
              name="username"
              className="form-control"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">New Password (optional)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="submit" className="btn btn-success">Update Employee</button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/display-employees")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
