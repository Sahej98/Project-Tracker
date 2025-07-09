import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

export default function AddProjectPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    category: "App",
    priority: "medium",
    assignedTo: [],
    clientId: "",
  });

  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setEmployees(res.data.employees || []);
        setClients(res.data.clients || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      navigate("/projects");
    } catch (err) {
      console.error("Failed to add project", err);
    }
  };

  const addEmployee = () => {
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
  };

  const removeEmployee = (empId) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== empId),
    }));
  };

  return (
    <div className="container-fluid mt-4">
      <div className="mx-auto" style={{ maxWidth: "960px" }}>
        <h2 className="mb-4">Add Project</h2>

        <form onSubmit={handleSubmit} className="bg-white border rounded shadow-sm p-4">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Project Title</label>
              <input
                name="title"
                className="form-control"
                placeholder="Enter project title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-control"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="Enter project description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                <option value="App">App Development</option>
                <option value="Web">Web Development</option>
                <option value="ERP">ERP</option>
                <option value="CRM">CRM</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-select"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Assign Employees</label>
            <div className="d-flex gap-2 mb-2">
              <select
                className="form-select"
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
                className="btn btn-outline-primary"
                onClick={addEmployee}
              >
                Add
              </button>
            </div>

            {form.assignedTo.length > 0 && (
              <ul className="list-group">
                {form.assignedTo.map((id) => {
                  const emp = employees.find((e) => e._id === id);
                  return (
                    <li
                      key={id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {emp?.fullname || emp?.username || "Unknown"}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeEmployee(id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Select Client</label>
            <select
              name="clientId"
              className="form-select"
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
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-success">
              Add Project
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/projects")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
