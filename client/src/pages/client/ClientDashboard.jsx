import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#007bff", "#ffc107", "#28a745", "#6c757d"];

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          setClientName(decoded.fullname);
        }

        const res = await api.get("/projects");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
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

  const inProgressProjects = projects.filter((p) => p.status === "in progress");
  const completedProjects = projects.filter((p) => p.status === "completed");

  return (
    <div className="container-fluid py-4 px-2 px-md-5">
      <h4 className="fw-semibold text-muted mb-1">Welcome back,</h4>
      <h2 className="fw-bold mb-4 text-primary">{clientName}</h2>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <div className="row g-4">
          <DashboardCard title="Total Projects" count={projects.length} color="primary" />
          <DashboardCard title="In Progress Projects" count={inProgressProjects.length} color="warning" />
          <DashboardCard title="Completed Projects" count={completedProjects.length} color="success" />

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
                      fill="#8884d8"
                      label
                    >
                      {getStatusBreakdown().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted mt-3">No projects to display</p>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow rounded-4 p-4 d-flex flex-column justify-content-between h-100">
              <div>
                <h5 className="mb-3">Quick Access</h5>
                <p className="text-muted">
                  You can view and track your project progress on the projects page.
                </p>
              </div>
              <button
                onClick={() => navigate("/projects")}
                className="btn btn-outline-primary align-self-start mt-3"
              >
                View My Projects
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
    <div className="col-md-4">
      <div className={`card shadow border-start border-${color} border-4 rounded-4`}>
        <div className="card-body text-center py-4">
          <h6 className="text-muted">{title}</h6>
          <h3 className={`fw-bold text-${color}`}>{count}</h3>
        </div>
      </div>
    </div>
  );
}
