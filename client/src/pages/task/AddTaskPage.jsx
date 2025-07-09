import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function AddTaskPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    subtasks: [],
    projectId: projectId,
  });

  const [newSubtask, setNewSubtask] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setForm((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, { title: newSubtask }],
      }));
      setNewSubtask("");
    }
  };

  const handleRemoveSubtask = (index) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      await api.post("/tasks", { ...form });
      navigate(`/display-project/${projectId}`);
    } catch (err) {
      console.error("Failed to create task", err);
      setError("Failed to create task.");
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card mx-auto shadow-sm" style={{ maxWidth: "700px" }}>
        <div className="card-body">
          <h4 className="mb-4">Add New Task</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Task Title</label>
              <input
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional description"
              />
            </div>

            {/* Subtasks */}
            <div className="mb-3">
              <label className="form-label">Subtasks</label>
              <div className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Enter subtask title"
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleAddSubtask}
                >
                  Add
                </button>
              </div>
              {form.subtasks.length > 0 && (
                <ul className="list-group">
                  {form.subtasks.map((sub, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {sub.title}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveSubtask(index)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-success">
                Create Task
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/display-project/${projectId}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
