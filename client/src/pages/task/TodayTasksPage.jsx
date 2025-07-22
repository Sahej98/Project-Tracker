import { useEffect, useState } from "react";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TodayTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [reportId, setReportId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [adminReports, setAdminReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionComplete, setSubmissionComplete] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      setUserId(decoded.userId);

      const fetchTodayTasks = async () => {
        setLoading(true);
        try {
          if (decoded.role === "employee") {
            const res = await api.get(`/daily-tasks/today/${decoded.userId}`);
            const tasksWithTime = res.data.tasks.map((t) => {
              let hours = 0;
              let minutes = 0;

              if (t.timeSpent) {
                const match = t.timeSpent.match(/(\d+)h\s*(\d+)m/);
                if (match) {
                  hours = parseInt(match[1], 10);
                  minutes = parseInt(match[2], 10);
                }
              }

              return {
                ...t,
                status: t.status || "pending",
                remarks: t.remarks || "",
                timeHours: hours,
                timeMinutes: minutes,
              };
            });

            setTasks(tasksWithTime);
            setReportId(res.data._id || "");
          } else {
            const res = await api.get(`/daily-tasks/today`);
            setAdminReports(res.data.grouped || {});
          }
        } catch (err) {
          console.error("Failed to fetch today’s data", err);
          toast.error("❌ Failed to load data");
        } finally {
          setLoading(false);
        }
      };

      fetchTodayTasks();
    } catch (err) {
      console.error("Invalid token", err);
      toast.error("❌ Invalid Token");
    }
  }, []);

  const handleChange = (taskKey, field, value) => {
    setTasks((prev) =>
      prev.map((t) =>
        `${t.taskId}-${t.subtaskIndex}` === taskKey
          ? { ...t, [field]: value }
          : t
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const updatePayload = tasks.map((t) => {
        let timeSpent = undefined;

        if (t.timeHours > 0 || t.timeMinutes > 0) {
          timeSpent = `${t.timeHours}h ${t.timeMinutes}m`;
        }

        return {
          taskId: t.taskId,
          subtaskIndex: t.subtaskIndex,
          status: t.status || "pending",
          remarks: t.remarks !== undefined ? t.remarks : "",
          timeSpent: timeSpent,
        };
      });

      await api.put(`/daily-tasks/${reportId}`, { tasks: updatePayload });

      toast.success("✅ Report submitted!");
      setSubmissionComplete(true);
      setTasks([]);
    } catch (err) {
      console.error("Failed to submit report", err);
      toast.error("❌ Submission failed");
    }
  };

  const getHourOptions = () => {
    return Array.from({ length: 13 }, (_, i) => (
      <option key={i} value={i}>
        {i} hr
      </option>
    ));
  };

  const getMinuteOptions = () => {
    return Array.from({ length: 60 }, (_, i) => (
      <option key={i} value={i}>
        {i} min
      </option>
    ));
  };

  if (loading)
    return <div className="container py-5 text-center">Loading...</div>;

  return (
    <div className="container py-3 px-md-5">
      <ToastContainer position="top-center" autoClose={2500} />

      <h2 className="fw-semibold text-dark mb-4">Today's Tasks</h2>

      {userRole === "employee" && (
        <>
          {submissionComplete ? (
            <div className="alert alert-success text-center mt-4">
              🎉 You have completed today's tasks!
            </div>
          ) : tasks.length === 0 ? (
            <div className="alert alert-info text-center">
              No tasks selected for today.
            </div>
          ) : (
            <>
              <div className="d-flex flex-column gap-3 mb-4">
                {Object.entries(
                  tasks.reduce((acc, task) => {
                    if (!acc[task.projectTitle]) acc[task.projectTitle] = [];
                    acc[task.projectTitle].push(task);
                    return acc;
                  }, {})
                ).map(([projectTitle, projectTasks]) => (
                  <div key={projectTitle} className="card shadow p-3 bg-white">
                    <h5 className="fw-semibold mb-3 text-primary">
                      {projectTitle}
                    </h5>

                    {projectTasks.map((t) => {
                      const taskKey = `${t.taskId}-${t.subtaskIndex}`;

                      return (
                        <div
                          key={taskKey}
                          className="p-2 rounded border bg-light mb-3"
                        >
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div style={{ flex: 1 }}>
                              <h6 className="mb-1 fw-bold">{t.taskTitle}</h6>
                              <p className="mb-0 text-muted small">
                                ➝ {t.subtaskTitle}
                              </p>
                            </div>

                            <div
                              className="d-flex gap-2 mt-2 mt-md-0"
                              style={{ flex: 1 }}
                            >
                              <select
                                className="form-select form-select-sm"
                                style={{ minWidth: "150px" }}
                                value={t.status}
                                onChange={(e) =>
                                  handleChange(
                                    taskKey,
                                    "status",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="pending">Pending</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>

                              <div
                                className="d-flex gap-1 flex-wrap"
                                style={{ minWidth: "160px" }}
                              >
                                <select
                                  className="form-select form-select-sm"
                                  value={t.timeHours}
                                  onChange={(e) =>
                                    handleChange(
                                      taskKey,
                                      "timeHours",
                                      Number(e.target.value)
                                    )
                                  }
                                >
                                  {getHourOptions()}
                                </select>

                                <select
                                  className="form-select form-select-sm"
                                  value={t.timeMinutes}
                                  onChange={(e) =>
                                    handleChange(
                                      taskKey,
                                      "timeMinutes",
                                      Number(e.target.value)
                                    )
                                  }
                                >
                                  {getMinuteOptions()}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Remarks"
                              value={t.remarks}
                              onChange={(e) =>
                                handleChange(taskKey, "remarks", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="text-end">
                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={handleSubmit}
                >
                  Submit Report
                </button>
              </div>
            </>
          )}
        </>
      )}

      {(userRole === "admin" || userRole === "manager") && (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search employee..."
              style={{ maxWidth: "300px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {Object.keys(adminReports).length === 0 ? (
            <p className="text-muted text-center">
              No reports submitted today.
            </p>
          ) : (
            <div className="d-flex flex-column gap-4">
              {Object.entries(adminReports)
                .filter(([employeeName]) =>
                  employeeName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(([employeeName, projects]) => (
                  <div key={employeeName} className="card p-3 shadow bg-white">
                    <h5 className="mb-3 fw-semibold">{employeeName}</h5>

                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Project</th>
                          <th>Task</th>
                          <th>Subtask</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(projects).map(
                          ([projectTitle, tasks]) => {
                            let projectRowSpan = 0;
                            Object.values(tasks).forEach((subtaskList) => {
                              projectRowSpan += subtaskList.length;
                            });

                            let firstProjectRow = true;

                            return Object.entries(tasks).map(
                              ([taskTitle, subtasks]) => {
                                let taskRowSpan = subtasks.length;

                                return subtasks.map((subtask, idx) => {
                                  const row = (
                                    <tr
                                      key={`${employeeName}-${projectTitle}-${taskTitle}-${idx}`}
                                    >
                                      {firstProjectRow && idx === 0 && (
                                        <td
                                          rowSpan={projectRowSpan}
                                          className="align-middle fw-semibold"
                                        >
                                          {projectTitle}
                                        </td>
                                      )}
                                      {idx === 0 && (
                                        <td
                                          rowSpan={taskRowSpan}
                                          className="align-middle"
                                        >
                                          {taskTitle}
                                        </td>
                                      )}
                                      <td>{subtask.subtaskTitle}</td>
                                      <td>{subtask.status}</td>
                                    </tr>
                                  );

                                  if (
                                    firstProjectRow &&
                                    idx === subtasks.length - 1
                                  ) {
                                    firstProjectRow = false;
                                  }

                                  return row;
                                });
                              }
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
