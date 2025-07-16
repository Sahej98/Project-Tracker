import { useEffect, useState } from "react";
import api from "../../axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Status color mapping
const STATUS_COLORS = {
  pending: "#6c757d",       // Grey
  "in progress": "#0d6efd", // Blue
  completed: "#198754",     // Green
};

export default function EmployeeDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          setEmployeeName(decoded.fullname || "Employee");

          const res = await api.get("/projects");
          const allProjects = res.data || [];

          const employeeId = decoded.userId;

          const filtered = allProjects.filter((p) =>
            p.assignedTo?.some(
              (emp) => emp._id === employeeId || emp === employeeId
            )
          );

          setProjects(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch employee projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeProjects();
  }, []);

  const getStatusBreakdown = () => {
    const statusCount = {};
    projects.forEach((p) => {
      const status = p.status || "unknown";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status[0].toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  const notStarted = projects.filter((p) => p.status === "pending");
  const inProgress = projects.filter((p) => p.status === "in progress");
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <div className="container-fluid py-4 px-2 px-md-5">
      <h2 className="fw-bold mb-3 text-dark">Welcome, {employeeName} 👋</h2>
      <p className="text-muted mb-4">
        Here’s an overview of your project activity
      </p>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <div className="row g-4">
          <DashboardCard title="Total Projects" count={projects.length} color="dark" />
          <DashboardCard title="Not Started" count={notStarted.length} color="secondary" />
          <DashboardCard title="In Progress" count={inProgress.length} color="primary" />
          <DashboardCard title="Completed" count={completed.length} color="success" />

          <div className="col-md-6">
            <div className="card shadow rounded-4 p-4 h-100">
              <h5 className="mb-3">Project Status Overview</h5>
              {projects.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getStatusBreakdown()}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {getStatusBreakdown().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name.toLowerCase()] || "#adb5bd"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted mt-3">No project data available</p>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow rounded-4 p-4 d-flex flex-column justify-content-between h-100">
              <div>
                <h5 className="mb-3">Quick Access</h5>
                <p className="text-muted">
                  Head to the projects page to view and manage your tasks.
                </p>
              </div>
              <button
                onClick={() => navigate("/projects")}
                className="btn btn-outline-primary align-self-start mt-3"
              >
                Go to Projects
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, count, color }) {
  return (
    <div className="col-md-3">
      <div
        className={`card shadow border-start border-${color} border-4 rounded-4`}
      >
        <div className="card-body text-center py-4">
          <h6 className="text-muted">{title}</h6>
          <h3 className={`fw-bold text-${color}`}>{count}</h3>
        </div>
      </div>
    </div>
  );
}
