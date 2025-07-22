import { useEffect, useState } from "react";
import api from "../../axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [timeData, setTimeData] = useState([]);
  const [weeklyTasksData, setWeeklyTasksData] = useState([]);
  const [weeklyProjectsData, setWeeklyProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, timeRes, tasksRes, projectsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/stats/time"),
          api.get("/admin/stats/tasks-per-week"),
          api.get("/admin/stats/projects-per-week"),
        ]);

        setStats(statsRes.data);

        setTimeData(timeRes.data.map(item => {
          const totalMinutes = (item.totalHours * 60) + item.totalMinutes;
          return {
            date: item.date,
            totalMinutes,
            label: `${item.totalHours}h ${item.totalMinutes}m`
          };
        }));

        setWeeklyTasksData(tasksRes.data.map(item => ({
          week: item.week,
          completed: item.completedTasks
        })));

        setWeeklyProjectsData(projectsRes.data.map(item => ({
          week: item.week,
          completed: item.completedProjects
        })));

      } catch (err) {
        console.error("❌ Failed to load admin dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="container py-5 text-center"><h4>Loading...</h4></div>;
  if (!stats) return <div className="container py-5 text-center"><h4>Error loading dashboard.</h4></div>;

  return (
    <div className="container py-4 px-md-5">
      <h2 className="mb-5 text-dark">Admin Dashboard</h2>

      <div className="row g-4 mb-4">
        <DashboardCard title="Managers" count={stats.managers} color="info" />
        <DashboardCard title="Employees" count={stats.employees} color="primary" />
        <DashboardCard title="Clients" count={stats.clients} color="secondary" />
        <DashboardCard title="All Projects" count={stats.projects.total} color="dark" />
        <DashboardCard title="Pending Projects" count={stats.projects.pending} color="warning" />
        <DashboardCard title="In Progress Projects" count={stats.projects.inProgress} color="primary" />
        <DashboardCard title="Completed Projects" count={stats.projects.completed} color="success" />
        <DashboardCard title="Blocked Projects" count={stats.projects.blocked || 0} color="danger" />
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow rounded-4 p-4 h-100 d-flex flex-column">
            <h5 className="mb-4">Time Spent on Projects</h5>
            <div className="flex-grow-1">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value, name, props) => `${props.payload.label}`} />
                  <Legend />
                  <Line type="monotone" dataKey="totalMinutes" stroke="#0d6efd" strokeWidth={3} name="Time Spent (min)" />
                </LineChart>
              </ResponsiveContainer>
              <ul className="mt-3 text-muted small mb-0">
                {timeData.map(item => (
                  <li key={item.date}>{item.date}: {item.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow rounded-4 p-4 h-100 d-flex flex-column">
            <h5 className="mb-4">Tasks Completed Per Week</h5>
            <div className="flex-grow-1">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyTasksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#198754" name="Completed Tasks" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow rounded-4 p-4">
            <h5 className="mb-4">Projects Completed Per Week</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyProjectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#0d6efd" name="Completed Projects" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, count, color }) {
  return (
    <div className="col-6 col-md-3">
      <div className={`card shadow border-start border-${color} border-4 rounded-4`}>
        <div className="card-body text-center py-4">
          <h6 className="text-muted">{title}</h6>
          <h3 className={`fw-bold text-${color}`}>{count}</h3>
        </div>
      </div>
    </div>
  );
}
