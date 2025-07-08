import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import "../../styles/employee/EmployeeForm.css";

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
        const employee = res.data.employees.find((e) => e._id === id);
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
    <div className="employee-form-page">
      <h2>Edit Employee</h2>
      <form onSubmit={handleSubmit} className="employee-form">
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
          <button type="submit">Update Employee</button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/display-employees")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
