import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function DisplayProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskOpenStates, setTaskOpenStates] = useState({});

  useEffect(() => {
    async function fetchProjectAndTasks() {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);

        const taskRes = await api.get(`/tasks?projectId=${id}`);
        setTasks(taskRes.data || []);
      } catch (err) {
        console.error("Failed to fetch project or tasks", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectAndTasks();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        navigate("/projects");
      } catch (err) {
        console.error("Failed to delete project", err);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-project/${id}`);
  };

  const handleAddTask = () => {
    navigate(`/add-task/${id}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mt-4">
        <p className="text-danger">Project not found.</p>
      </div>
    );
  }

  const handleSubtaskToggle = async (taskId, subtaskIndex) => {
    try {
      await api.patch(`/tasks/${taskId}/toggle-subtask`, { subtaskIndex });

      // Refetch tasks and project to reflect updates
      const taskRes = await api.get(`/tasks?projectId=${id}`);
      setTasks(taskRes.data || []);

      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);
    } catch (err) {
      console.error("Failed to toggle subtask", err);
    }
  };

  const toggleTaskOpen = (taskId) => {
    setTaskOpenStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    })); // In your task controller
    const toggleSubtask = async (req, res) => {
      try {
        const { id } = req.params;
        const { subtaskIndex } = req.body;

        if (subtaskIndex === undefined) {
          return res.status(400).json({ message: "Subtask index required" });
        }

        const task = await Task.findById(id);
        if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
          return res.status(404).json({ message: "Subtask not found" });
        }

        task.subtasks[subtaskIndex].completed =
          !task.subtasks[subtaskIndex].completed;

        // Update task and possibly project status
        // ...

        await task.save();
        res.status(200).json(task);
      } catch (err) {
        console.error("Error toggling subtask:", err);
        res.status(500).json({ message: "Server error toggling subtask" });
      }
    };
  };

  return (
    <div
      className="container-fluid py-2"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="bg-white shadow-sm rounded-4 p-4 w-100 card shadow mb-4">
        <h3 className="mb-4 border-bottom pb-2">Project Details</h3>

        <DetailRow label="Title" value={project.title} />
        <DetailRow label="Description" value={project.description || "N/A"} />
        <DetailRow
          label="Deadline"
          value={
            project.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : "N/A"
          }
        />
        <DetailRow label="Category" value={project.category || "N/A"} />
        <DetailRow label="Priority" value={project.priority || "N/A"} />
        <DetailRow
          label="Status"
          value={
            <span
              className={`badge px-3 py-1 bg-${getStatusColor(project.status)}`}
            >
              {project.status}
            </span>
          }
        />
        <DetailRow
          label="Client"
          value={
            typeof project.clientId === "object"
              ? project.clientId?.fullname ||
                project.clientId?.username ||
                "N/A"
              : project.clientId || "N/A"
          }
        />
        <DetailRow
          label="Assigned Employees"
          value={
            Array.isArray(project.assignedTo) && project.assignedTo.length > 0
              ? project.assignedTo
                  .map((emp) =>
                    typeof emp === "object" ? emp.fullname || emp.username : emp
                  )
                  .join(", ")
              : "None"
          }
        />

        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-outline-primary" onClick={handleEdit}>
            Edit
          </button>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={handleAddTask}>
          + Add Task
        </button>
      </div>

      {/* Tasks Section */}
      {tasks.map((task, taskIndex) => {
        const completedSubtasks =
          task.subtasks?.filter((s) => s.completed)?.length || 0;

        const isOpen = taskOpenStates[task._id] || false;

        return (
          <div key={task._id} className="card mb-3 shadow-sm">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => toggleTaskOpen(task._id)}
            >
              <div>
                <h6 className="mb-1">{task.title}</h6>
                <small className="text-muted">Status: {task.status}</small>
              </div>
              <span className="badge bg-light text-dark">
                {completedSubtasks}/{task.subtasks?.length || 0} Subtasks
              </span>
            </div>

            {isOpen && (
              <div className="card-body">
                {task.subtasks && task.subtasks.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {task.subtasks.map((subtask, subIndex) => (
                      <li
                        key={subIndex}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span
                          style={{
                            textDecoration: subtask.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {subtask.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() =>
                            handleSubtaskToggle(task._id, subIndex)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">No subtasks</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="row mb-3">
      <div className="col-sm-6 text-start">
        <small className="text-muted">{label}</small>
      </div>
      <div className="col-sm-6 text-end fw-semibold text-dark">{value}</div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "not started":
      return "secondary";
    case "in progress":
      return "info";
    case "completed":
      return "success";
    case "on hold":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "dark";
  }
}
