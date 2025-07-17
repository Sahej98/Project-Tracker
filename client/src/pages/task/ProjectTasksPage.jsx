import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function ProjectTasksPage() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState(
    JSON.parse(localStorage.getItem(`today-${projectId}`)) || []
  );
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState(""); // ✅ New: search input
  const navigate = useNavigate();

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

    api
      .post("/daily-tasks", { userId, subtasks: payload })
      .then(() => alert("✅ Saved"))
      .catch((e) => {
        console.error(e);
        alert("❌ Failed");
      });
  };

  // ✅ Filter tasks based on search
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-3">📋 Select Today's Tasks</h3>

      {/* ✅ Row with Search + Add Task Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          className="form-control"
          style={{ maxWidth: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {(userRole === "admin" || userRole === "manager") && (
          <button className="btn btn-success" onClick={() => navigate(`/add-task/${projectId}`)}>➕ Add Task</button>
        )}
      </div>

      {filteredTasks.map((t) => (
        <div key={t._id} className="card mb-2">
          <div
            className="card-header px-4 py-3 d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => toggleExpand(t._id)}
          >
            <span>{t.title}</span>
            <span className="text-muted">
              {expandedTasks.includes(t._id) ? "▲" : "▼"}
            </span>
          </div>

          {expandedTasks.includes(t._id) && (
            <ul className="list-group list-group-flush">
              {t.subtasks?.map((s, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex align-items-center"
                >
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedSubtasks.includes(`${t._id}-${i}`)}
                    onChange={() => toggleSubtask(t._id, i)}
                    id={`${t._id}-${i}`}
                  />
                  <label className="form-check-label" htmlFor={`${t._id}-${i}`}>
                    {s.title}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* ✅ Save Button for employees only */}
      {userRole == "employee" && (
        <div className="text-end mt-4">
          <button className="btn btn-primary" onClick={submit}>
            💾 Save Daily Tasks
          </button>
        </div>
      )}
    </div>
  );
}
