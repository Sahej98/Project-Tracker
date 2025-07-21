import { useEffect, useState } from "react";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TodayTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [reportId, setReportId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [adminReports, setAdminReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);

      const fetchTodayTasks = async () => {
        setLoading(true);
        try {
          if (decoded.role === "employee") {
            const res = await api.get(`/daily-tasks/today/${decoded.userId}`);
            setTasks(res.data.tasks || []);
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

      toast.success("✅ Report submitted!");

      // Clear tasks after submission
      setTasks([]);
      setReportId("");

      // Clear localStorage subtasks selection (if any key was used for that)
      // If you used `today-<projectId>` before, remove those keys here if needed
    } catch (err) {
      console.error("Failed to submit report", err);
      toast.error("❌ Submission failed");
    }
  };

  const handleDownloadCSV = () => {
    let csv = "Employee,Project,Task,Subtask,Status,Remarks\n";

    Object.entries(adminReports).forEach(([employeeName, projects]) => {
      Object.entries(projects).forEach(([projectTitle, tasks]) => {
        Object.entries(tasks).forEach(([taskTitle, subtasks]) => {
          subtasks.forEach((subtask) => {
            csv += `"${employeeName}","${projectTitle}","${taskTitle}","${subtask.subtaskTitle}","${subtask.status}","${subtask.remarks}"\n`;
          });
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "today-tasks.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading)
    return <div className="container py-5 text-center">Loading...</div>;

  return (
    <div className="container-fluid py-3 px-1 px-md-5">
      <ToastContainer position="top-center" autoClose={2500} />

      <h2 className="fw-semibold text-dark mb-4">Today's Tasks</h2>

      {userRole === "employee" && (
        <>
          {tasks.length === 0 ? (
            <div className="alert alert-info text-center">
              No tasks selected for today.
            </div>
          ) : (
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

                  {projectTasks.map((t, i) => (
                    <div
                      key={t.taskId + "-" + t.subtaskIndex}
                      className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 p-2 rounded border bg-light"
                    >
                      <div className="mb-2 mb-md-0">
                        <h6 className="mb-1 fw-bold">{t.taskTitle}</h6>
                        <p className="mb-0 text-muted small">
                          ➝ {t.subtaskTitle}
                        </p>
                      </div>

                      <div className="d-flex gap-2 flex-wrap mt-2 mt-md-0">
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: "150px" }}
                          value={t.status}
                          onChange={(e) =>
                            handleChange(i, "status", e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Remarks"
                          value={t.remarks}
                          onChange={(e) =>
                            handleChange(i, "remarks", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tasks.length > 0 && (
            <div className="text-end">
              <button
                className="btn btn-primary px-4 py-2"
                onClick={handleSubmit}
              >
                Submit Report
              </button>
            </div>
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

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={handleDownloadCSV}
              >
                📥 CSV
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleDownloadPDF}
              >
                🖨️ PDF
              </button>
            </div>
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
                          <th style={{ width: "25%" }}>Project</th>
                          <th style={{ width: "25%" }}>Task</th>
                          <th style={{ width: "25%" }}>Subtask</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(projects).map(([projectTitle, tasks]) => {
                          let projectRowSpan = 0;
                          Object.values(tasks).forEach((subtaskList) => {
                            projectRowSpan += subtaskList.length;
                          });

                          let firstProjectRow = true;

                          return Object.entries(tasks).map(([taskTitle, subtasks]) => {
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
                                    <td rowSpan={taskRowSpan} className="align-middle">
                                      {taskTitle}
                                    </td>
                                  )}
                                  <td>{subtask.subtaskTitle}</td>
                                  <td>{subtask.status}</td>
                                </tr>
                              );

                              if (firstProjectRow && idx === subtasks.length - 1) {
                                firstProjectRow = false;
                              }

                              return row;
                            });
                          });
                        })}
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
