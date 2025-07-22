import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import { jwtDecode } from "jwt-decode";

export default function DisplayProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    }
  }, []);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        navigate("/projects");
      } catch (err) {
        console.error("Failed to delete project", err);
      }
    }
  };

  const handleEdit = () => navigate(`/edit-project/${id}`);
  const handleViewTasks = () => navigate(`/projects/${id}/tasks`);
  const handleCancel = () => navigate(-1);

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mt-4">
        <p className="text-danger">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2">
      <div className="bg-white shadow-sm rounded-4 p-4 w-100 card shadow mb-4">
        <h3 className="mb-4 border-bottom pb-2">Project Details</h3>

        <DetailRow label="Title" value={project.title} />
        <DetailRow label="Description" value={project.description || "N/A"} />
        <DetailRow
          label="Status"
          value={
            <span className={`badge px-3 py-1 bg-${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          }
        />

        {userRole !== "client" && (
          <>
            <DetailRow
              label="Deadline"
              value={
                project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : "N/A"
              }
            />
            <DetailRow label="Category" value={project.category || "N/A"} />
            <DetailRow label="Priority" value={project.priority || "N/A"} />
            <DetailRow
              label="Client"
              value={
                typeof project.clientId === "object"
                  ? project.clientId?.fullname || project.clientId?.username || "N/A"
                  : project.clientId || "N/A"
              }
            />
            <DetailRow
              label="Assigned Employees"
              value={
                Array.isArray(project.assignedTo) && project.assignedTo.length > 0
                  ? project.assignedTo
                      .map((emp) =>
                        typeof emp === "object"
                          ? emp.fullname || emp.username
                          : emp
                      )
                      .join(", ")
                  : "None"
              }
            />
          </>
        )}

        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={handleCancel}>
            Back
          </button>
          <button className="btn btn-outline-dark" onClick={handleViewTasks}>
            View Tasks
          </button>
          {["admin", "manager"].includes(userRole) && (
            <>
              <button className="btn btn-outline-primary" onClick={handleEdit}>
                Edit
              </button>
              <button className="btn btn-outline-danger" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="row mb-3">
      <div className="col-sm-6 text-start">
        <small className="text-muted">{label}</small>
      </div>
      <div className="col-sm-6 text-end fw-semibold text-dark">{value}</div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "not started":
      return "secondary";
    case "in progress":
      return "info";
    case "completed":
      return "success";
    case "on hold":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "dark";
  }
}
