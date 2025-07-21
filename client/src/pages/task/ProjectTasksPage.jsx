import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProjectTasksPage() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState(
    JSON.parse(localStorage.getItem(`today-${projectId}`)) || []
  );
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const isAdminOrManager = userRole === "admin" || userRole === "manager";

  // Fetch tasks & user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { userId, role } = jwtDecode(token);
      setUserId(userId);
      setUserRole(role);
    }

    api
      .get(`/tasks?projectId=${projectId}`)
      .then((res) => setTasks(res.data))
      .catch(console.error);
  }, [projectId]);

  // Clean up selectedSubtasks if task list changed (prevent unknown task issues)
  useEffect(() => {
    const validKeys = [];

    tasks.forEach((task) => {
      task.subtasks.forEach((_, idx) => {
        validKeys.push(`${task._id}-${idx}`);
      });
    });

    const filtered = selectedSubtasks.filter((k) => validKeys.includes(k));

    if (filtered.length !== selectedSubtasks.length) {
      setSelectedSubtasks(filtered);
      localStorage.setItem(`today-${projectId}`, JSON.stringify(filtered));
    }
  }, [tasks, selectedSubtasks, projectId]);

  const toggleSubtask = (taskId, idx) => {
    const key = `${taskId}-${idx}`;
    const arr = selectedSubtasks.includes(key)
      ? selectedSubtasks.filter((k) => k !== key)
      : [...selectedSubtasks, key];

    setSelectedSubtasks(arr);
    localStorage.setItem(`today-${projectId}`, JSON.stringify(arr));
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const submit = () => {
    const payload = selectedSubtasks.map((k) => {
      const [taskId, subtaskIndex] = k.split("-");
      return { taskId, subtaskIndex: parseInt(subtaskIndex) };
    });

    const projectTitle =
      tasks[0]?.projectId?.title || tasks[0]?.projectTitle || "Unknown Project";

    api
      .post("/daily-tasks", {
        userId,
        projectId,
        projectTitle,
        subtasks: payload,
      })
      .then(() => {
        toast.success("✅ Tasks saved for today!");

        // 🔴 Clear checkboxes and localStorage
        setSelectedSubtasks([]);
        localStorage.removeItem(`today-${projectId}`);
      })
      .catch((e) => {
        console.error(e);
        toast.error("❌ Failed to save tasks");
      });
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.info("🗑️ Task deleted");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to delete task");
      }
    }
  };

  const deleteSubtask = async (taskId, subtaskIndex) => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      try {
        await api.patch(`/tasks/${taskId}/remove-subtask`, { subtaskIndex });
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.filter((_, i) => i !== subtaskIndex),
                }
              : t
          )
        );
        toast.info("❌ Subtask deleted");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to delete subtask");
      }
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" autoClose={2500} />

      <h3 className="fw-bold mb-3">📋 Select Today's Tasks</h3>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          className="form-control"
          style={{ maxWidth: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isAdminOrManager && (
          <button
            className="btn btn-success"
            onClick={() => navigate(`/add-task/${projectId}`)}
          >
            ➕ Add Task
          </button>
        )}
      </div>

      {filteredTasks.map((t) => (
        <div key={t._id} className="card mb-2 shadow-sm">
          <div
            className="card-header px-4 py-3 d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => toggleExpand(t._id)}
          >
            <span>{t.title}</span>

            <div className="d-flex align-items-center gap-2">
              {isAdminOrManager && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(t._id);
                  }}
                  title="Delete Task"
                >
                  🗑️
                </button>
              )}
              <span className="text-muted">
                {expandedTasks.includes(t._id) ? "▲" : "▼"}
              </span>
            </div>
          </div>

          {expandedTasks.includes(t._id) && (
            <ul className="list-group list-group-flush">
              {t.subtasks?.map((s, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    {userRole === "employee" && (
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={selectedSubtasks.includes(`${t._id}-${i}`)}
                        onChange={() => toggleSubtask(t._id, i)}
                        id={`${t._id}-${i}`}
                      />
                    )}
                    <label
                      className="form-check-label mb-0"
                      htmlFor={`${t._id}-${i}`}
                    >
                      {s.title}
                    </label>
                  </div>

                  {isAdminOrManager && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteSubtask(t._id, i)}
                      title="Delete Subtask"
                    >
                      ❌
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {userRole === "employee" && (
        <div className="text-end mt-4">
          <button className="btn btn-primary px-4 py-2" onClick={submit}>
            💾 Save Daily Tasks
          </button>
        </div>
      )}
    </div>
  );
}
