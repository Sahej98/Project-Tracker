import { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import "../styles/ProjectsPage.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="project-cont">
      <div className="projects-header">
        <h2>All Projects</h2>
        <button onClick={() => navigate("/add-project")} className="add-btn">
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))
      )}
    </div>
  );
}
