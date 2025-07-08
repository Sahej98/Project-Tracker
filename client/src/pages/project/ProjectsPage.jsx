import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import "../../styles/project/ProjectsPage.css";

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
    <div className="projects-page">
      <div className="top-bar">
        <h2>Projects</h2>
        <div className="top-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/add-project")}>
           + Add Project
          </button>
        </div>
      </div>

      <div className="project-list">
        {filteredProjects.map((project) => (
          <div
            key={project._id}
            className="project-card"
            onClick={() => openProjectDetails(project._id)}
          >
            <h4>{project.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
