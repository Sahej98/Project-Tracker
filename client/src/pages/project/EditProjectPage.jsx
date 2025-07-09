import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditProjectPage() {
  const { id } = useParams();
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
    const fetchData = async () => {
      try {
        const usersRes = await api.get("/users");
        setEmployees(usersRes.data.employees);
        setClients(usersRes.data.clients);

        const projectRes = await api.get(`/projects/${id}`);
        const project = projectRes.data.project;

        if (project) {
          setForm({
            ...project,
            deadline: project.deadline?.slice(0, 10),
          });
        }
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, form);
      navigate("/projects");
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Edit Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Project Title:</label>
            <input
              name="title"
              type="text"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Deadline:</label>
            <input
              name="deadline"
              type="date"
              className="form-control"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea
            name="description"
            className="form-control"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Category:</label>
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

          <div className="col-md-6">
            <label className="form-label">Priority:</label>
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
          <label className="form-label">Assign Employees:</label>
          <div className="input-group mb-2">
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
              className="btn btn-outline-secondary"
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
            <ul className="list-group">
              {form.assignedTo.map((id) => {
                const emp = employees.find((e) => e._id === id);
                return (
                  <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                    {emp?.fullname || emp?.username}
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
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
        </div>

        <div className="mb-4">
          <label className="form-label">Select Client:</label>
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

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-success">
            Update Project
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
  );
}
