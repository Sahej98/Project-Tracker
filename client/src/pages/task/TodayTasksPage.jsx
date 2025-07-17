import { useEffect, useState } from "react";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";

export default function TodayTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [reportId, setReportId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);

      const fetchTodayTasks = async () => {
        try {
          const res = await api.get(`/daily-tasks/today/${decoded.userId}`);
          console.log("Fetched tasks:", res.data.tasks);
          setTasks(res.data.tasks || []);
          setReportId(res.data._id || "");
        } catch (err) {
          console.error("Failed to fetch today’s tasks", err);
        }
      };

      fetchTodayTasks();
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  const handleChange = (index, field, value) => {
    setTasks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      await api.put(`/daily-tasks/${reportId}`, { tasks });
      alert("✅ Report submitted!");
    } catch (err) {
      console.error("Failed to submit report", err);
      alert("❌ Submission failed");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold">📝 Today's Tasks</h3>

      {tasks.length === 0 ? (
        <div className="alert alert-info">No tasks selected for today.</div>
      ) : (
        <div className="list-group">
          {tasks.map((t, i) => (
            <div key={t._id} className="list-group-item">
              <h6 className="mb-2">
                <strong>{t.taskTitle}</strong> ➝{" "}
                <small className="text-muted">{t.subtaskTitle}</small>
              </h6>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <select
                  className="form-select"
                  style={{ maxWidth: "200px", minWidth: "150px" }}
                  value={t.status}
                  onChange={(e) => handleChange(i, "status", e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  type="text"
                  className="form-control flex-fill"
                  placeholder="Remarks"
                  value={t.remarks}
                  onChange={(e) => handleChange(i, "remarks", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="text-end mt-4">
          <button className="btn btn-primary" onClick={handleSubmit}>
            📤 Submit Report
          </button>
        </div>
      )}
    </div>
  );
}
