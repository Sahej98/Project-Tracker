// src/pages/employees/EditEmployeePage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        const emp = res.data.employees.find((e) => e._id === id);
        if (emp) {
          setFormData({ ...emp, password: "" });
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
        {/* Same structure as Add page */}
        {/* Use same fields as in AddClientPage */}
        {/* Submit and Cancel buttons */}
        {/* Omitted for brevity */}
      </form>
    </div>
  );
}
