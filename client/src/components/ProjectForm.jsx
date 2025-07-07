import { useState, useEffect } from "react";
import api from "../axios";
import "../styles/ProjectForm.css";

export default function ProjectForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    category: "App dev",
    priority: "medium",
    assignedTo: [],
    clientId: "",
  });

  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        setEmployees(res.data.employees);
        setClients(res.data.clients);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/projects", form);
      onCreated(res.data);
      setForm({
        title: "",
        description: "",
        deadline: "",
        category: "App dev",
        priority: "medium",
        assignedTo: [],
        clientId: "",
      });
      setSelectedEmployee("");
    } catch (err) {
      alert("Failed to create project");
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h3>Create Project</h3>

      <input
        name="title"
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="deadline"
        value={form.deadline}
        onChange={handleChange}
      />

      <select name="category" value={form.category} onChange={handleChange}>
        <option>App dev</option>
        <option>Web dev</option>
        <option>ERP</option>
        <option>CRM</option>
      </select>

      <select name="priority" value={form.priority} onChange={handleChange}>
        <option>low</option>
        <option>medium</option>
        <option>high</option>
      </select>

      <label>Assign Employees:</label>
      <div className="assign-employee-section">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">Select employee</option>
          {employees
            .filter((e) => !form.assignedTo.includes(e._id))
            .map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullname || emp.username}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={() => {
            if (
              selectedEmployee &&
              !form.assignedTo.includes(selectedEmployee)
            ) {
              setForm((prev) => ({
                ...prev,
                assignedTo: [...prev.assignedTo, selectedEmployee],
              }));
              setSelectedEmployee("");
            }
          }}
        >
          Add
        </button>
      </div>

      {form.assignedTo.length > 0 && (
        <ul className="assigned-list">
          {form.assignedTo.map((id) => {
            const emp = employees.find((e) => e._id === id);
            return (
              <li key={id}>
                {emp?.fullname || emp?.username || "Unknown"}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      assignedTo: prev.assignedTo.filter((uid) => uid !== id),
                    }))
                  }
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <label>Client:</label>
      <select
        name="clientId"
        value={form.clientId}
        onChange={handleChange}
        required
      >
        <option value="">Select client</option>
        {clients.map((client) => (
          <option key={client._id} value={client._id}>
            {client.fullname || client.username}
          </option>
        ))}
      </select>

      <button type="submit">Create</button>
    </form>
  );
}
