import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DisplayProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data); // Populated data expected
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

  if (loading) return <div className="text-center py-5">Loading project details…</div>;
  if (!project) return <div className="text-center py-5 text-danger">Project not found.</div>;

  return (
    <div className="container py-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">{project.title}</h2>

          <div className="mb-3">
            <strong>Description:</strong>
            <p>{project.description || "N/A"}</p>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Deadline:</strong>
              <p>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="col-md-6">
              <strong>Category:</strong>
              <p>{project.category}</p>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Priority:</strong>
              <p className="text-capitalize">{project.priority}</p>
            </div>
            <div className="col-md-6">
              <strong>Status:</strong>
              <p className={`badge bg-${getStatusColor(project.status)}`}>
                {project.status}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <strong>Client:</strong>
            <p>
              {typeof project.clientId === "object"
                ? project.clientId.fullname || project.clientId.username
                : project.clientId || "N/A"}
            </p>
          </div>

          <div className="mb-3">
            <strong>Assigned Employees:</strong>
            <p>
              {Array.isArray(project.assignedTo) && project.assignedTo.length > 0
                ? project.assignedTo
                    .map((emp) =>
                      typeof emp === "object"
                        ? emp.fullname || emp.username
                        : emp
                    )
                    .join(", ")
                : "None"}
            </p>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate(`/edit-project/${project._id}`)}
            >
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional helper to color-code status
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
