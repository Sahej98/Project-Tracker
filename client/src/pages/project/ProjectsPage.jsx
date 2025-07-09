import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProjectDetails = (id) => {
    navigate(`/display-project/${id}`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0">Projects</h2>
        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: "200px" }}
          />
          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-project")}
          >
            + Add Project
          </button>
        </div>
      </div>

      <div className="row g-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                className="card h-100 shadow-sm cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => openProjectDetails(project._id)}
              >
                <div className="card-body">
                  <h5 className="card-title">{project.title}</h5>
                  <p className="card-text text-muted mb-0">
                    {project.category} | {project.priority}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No projects found.</p>
        )}
      </div>
    </div>
  );
}
