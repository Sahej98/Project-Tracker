import "../styles/ProjectCard.css";

export default function ProjectCard({ project, onDelete }) {
  return (
    <div className="card">
      <h3>{project.title}</h3>
      <p><b>Category:</b> {project.category}</p>
      <p><b>Deadline:</b> {project.deadline?.slice(0, 10)}</p>
      <p><b>Priority:</b> {project.priority}</p>
      <p><b>Client:</b> {project.clientId?.username || "N/A"}</p>

      {onDelete && (
        <button onClick={() => onDelete(project._id)} className="danger-btn">
          Delete
        </button>
      )}
    </div>
  );
}
