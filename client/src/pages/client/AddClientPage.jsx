import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import "../../styles/client/ClientForm.css";

export default function AddClientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    status: "active",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", { ...formData, role: "client" });
      navigate("/display-clients");
    } catch (err) {
      console.error("Failed to add client", err);
    }
  };

  return (
    <div className="client-form-page">
      <h2>Add Client</h2>
      <form className="client-form" onSubmit={handleSubmit}>
  <div className="form-row">
    <input name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} required />
    <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
  </div>
  <div className="form-row">
    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
  </div>
  <div className="form-row">
    <select name="status" value={formData.status} onChange={handleChange}>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
  <div>
    <button type="submit">Submit</button>
    <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
  </div>
</form>
    </div>
  );
}
