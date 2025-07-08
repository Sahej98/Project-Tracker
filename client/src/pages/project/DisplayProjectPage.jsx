import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import "../../styles/project/DisplayProjectPage.css";

export default function DisplayProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data); // Expected populated data
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

  if (loading) return <div className="loading">Loading project details…</div>;
  if (!project) return <div className="loading">Project not found.</div>;

  return (
    <div className="display-project-container">
      <div className="display-project-card">
        <h2 className="card-title">{project.title}</h2>
        <div className="card-body">
          <div className="info-row">
            <span className="label">Description:</span>
            <span className="value">{project.description || "N/A"}</span>
          </div>

          <div className="info-row">
            <span className="label">Deadline:</span>
            <span className="value">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          <div className="info-row">
            <span className="label">Category:</span>
            <span className="value">{project.category}</span>
          </div>

          <div className="info-row">
            <span className="label">Priority:</span>
            <span className="value">{project.priority}</span>
          </div>

          <div className="info-row">
            <span className="label">Status:</span>
            <span className={`value ${project.status}`}>{project.status}</span>
          </div>

          <div className="info-row">
            <span className="label">Client:</span>
            <span className="value">
              {typeof project.clientId === "object"
                ? project.clientId.fullname || project.clientId.username
                : project.clientId || "N/A"}
            </span>
          </div>

          <div className="info-row">
            <span className="label">Assigned Employees:</span>
            <span className="value">
              {Array.isArray(project.assignedTo) && project.assignedTo.length > 0
                ? project.assignedTo
                    .map((emp) =>
                      typeof emp === "object"
                        ? emp.fullname || emp.username
                        : emp
                    )
                    .join(", ")
                : "None"}
            </span>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="edit-btn"
            onClick={() => navigate(`/edit-project/${project._id}`)}
          >
            Edit
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
