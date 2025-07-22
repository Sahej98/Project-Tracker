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
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [claimedSubtasksMap, setClaimedSubtasksMap] = useState({});
  const navigate = useNavigate();

  const isAdminOrManager = userRole === "admin" || userRole === "manager";

  // Fetch tasks & claimed subtasks
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { userId, role } = jwtDecode(token);
      setUserId(userId);
      setUserRole(role);

      api.get(`/daily-tasks/today/${userId}`).then((res) => {
        const todayTasks = res.data.tasks || [];

        const projectSubtasks = todayTasks
          .filter((t) => t.projectId === projectId)
          .map((t) => `${t.taskId}-${t.subtaskIndex}`);

        const local = JSON.parse(localStorage.getItem(`today-${projectId}`)) || [];

        const merged = projectSubtasks.length > 0 ? projectSubtasks : local;
        setSelectedSubtasks(merged);
      });

      fetchTasksAndClaims();
    }
  }, [projectId]);

  // Save to local storage for persistence
  useEffect(() => {
    localStorage.setItem(`today-${projectId}`, JSON.stringify(selectedSubtasks));
  }, [selectedSubtasks, projectId]);

  const fetchTasksAndClaims = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data);

      const claimedMap = {};

      for (const task of res.data) {
        const response = await api.get(`/daily-tasks/claimed/${task._id}`);
        claimedMap[task._id] = response.data.claimed; // Array of subtask indexes
      }

      setClaimedSubtasksMap(claimedMap);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch tasks or claims");
    }
  };

  const toggleSubtask = (taskId, idx) => {
    const key = `${taskId}-${idx}`;
    setSelectedSubtasks((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
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
        projectId,
        projectTitle,
        subtasks: payload,
      })
      .then(() => {
        toast.success("✅ Tasks saved for today!");
        setSelectedSubtasks([]);
        localStorage.removeItem(`today-${projectId}`);
        fetchTasksAndClaims();
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
              ? { ...t, subtasks: t.subtasks.filter((_, i) => i !== subtaskIndex) }
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

  // Filter tasks for employee view
  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => {
      if (isAdminOrManager) return true;
      return t.subtasks.some((s) => s.status !== "completed");
    });

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

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={fetchTasksAndClaims}>
            🔄 Refresh Claimed
          </button>

          {isAdminOrManager && (
            <button
              className="btn btn-success"
              onClick={() => navigate(`/add-task/${projectId}`)}
            >
              ➕ Add Task
            </button>
          )}
        </div>
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
              {t.subtasks?.map((s, i) => {
                if (!isAdminOrManager && s.status === "completed") return null;

                const key = `${t._id}-${i}`;
                const isSelectedByMe = selectedSubtasks.includes(key);
                const isClaimedByOther =
                  claimedSubtasksMap[t._id]?.includes(i) && !isSelectedByMe;

                return (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {s.title}
                      {isClaimedByOther && (
                        <span className="badge bg-warning text-dark ms-2">Taken</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {isAdminOrManager && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteSubtask(t._id, i)}
                          title="Delete Subtask"
                        >
                          ❌
                        </button>
                      )}

                      {userRole === "employee" && (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isSelectedByMe}
                          disabled={isClaimedByOther}
                          onChange={() => toggleSubtask(t._id, i)}
                          id={key}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      {userRole === "employee" && selectedSubtasks.length > 0 && (
        <div className="text-end mt-4">
          <button className="btn btn-primary px-4 py-2" onClick={submit}>
            💾 Save Daily Tasks
          </button>
        </div>
      )}
    </div>
  );
}
