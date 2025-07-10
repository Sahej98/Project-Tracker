import { useEffect, useState } from "react";
import api from "../../axios";

export default function AdminDashboard() {
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [employeesRes, managersRes, clientsRes, projectsRes] =
          await Promise.all([
            api.get("/users/role/employee"),
            api.get("/users/role/manager"),
            api.get("/users/role/client"),
            api.get("/projects"),
          ]);

        console.log("Employee data:", employeesRes.data);
        console.log("Manager data:", managersRes.data);
        console.log("Client data:", clientsRes.data);
        console.log("Project data:", projectsRes.data);

        setEmployees(employeesRes.data);
        setManagers(managersRes.data);
        setClients(clientsRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error("❌ Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const assignedProjects = projects.filter((p) => p.assignedTo?.length > 0);
  const completedProjects = projects.filter((p) => p.status === "completed");

  return (
    <div className="container-fluid py-4 px-2 px-md-5">
      <h2 className="fw-bold mb-4 text-dark">Admin Dashboard</h2>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <div className="row g-4">
          <DashboardCard
            title="Managers"
            count={managers.length}
            color="info"
          />
          <DashboardCard
            title="Employees"
            count={employees.length}
            color="primary"
          />
          <DashboardCard
            title="Clients"
            count={clients.length}
            color="secondary"
          />
          <DashboardCard
            title="Total Projects"
            count={projects.length}
            color="dark"
          />
          <DashboardCard
            title="Assigned Projects"
            count={assignedProjects.length}
            color="warning"
          />
          <DashboardCard
            title="Completed Projects"
            count={completedProjects.length}
            color="success"
          />

          {/* Future analytics section */}
          <div className="col-12">
            <div className="card shadow rounded-4 p-4">
              <h5 className="mb-3">Analytics (Coming Soon)</h5>
              <p className="text-muted">
                Charts, project stats, and activity trends will appear here.
              </p>
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
