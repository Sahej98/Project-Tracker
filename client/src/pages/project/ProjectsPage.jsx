import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../axios";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          setUserRole(decoded.role);
        }

        const res = await api.get("/projects");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects
    .filter((project) => {
      const titleMatch = project.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (userRole === "client") {
        return titleMatch; // ✅ Only search by title
      }

      const clientMatch = project.clientId?.fullname
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return titleMatch || clientMatch;
    })
    .sort((a, b) => {
      if (userRole === "client") return 0; // ✅ Disable sorting for client

      switch (sortOption) {
        case "priority":
          return (a.priority || "").localeCompare(b.priority || "");
        case "deadline":
          return new Date(a.deadline) - new Date(b.deadline);
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return 0;
      }
    });

  const openProjectDetails = (id) => {
    navigate(`/display-project/${id}`);
  };

  return (
    <div className="container-fluid py-4 px-1 px-md-5">
      <h2 className="fw-semibold mb-3 text-dark">Projects</h2>

      <div className="row align-items-end mb-4">
        <div className="col-md-6 d-flex flex-column flex-md-row gap-2">
          <input
            type="text"
            className="form-control"
            placeholder={
              userRole === "client"
                ? "Search by project title..."
                : "Search by project title or client name..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* ✅ Hide sorting for clients */}
          {userRole !== "client" && (
            <select
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort by</option>
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
              <option value="category">Category</option>
              <option value="status">Progress</option>
            </select>
          )}
        </div>

        <div className="col-md-6 d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
          {/* ✅ Only show Add Project for manager/admin */}
          {(userRole === "admin" || userRole === "manager") && (
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/add-project")}
            >
              + Add Project
            </button>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-muted text-center">No projects found.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="card shadow-sm p-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between"
              style={{ cursor: "pointer" }}
              onClick={() => openProjectDetails(project._id)}
            >
              <div className="mb-2 mb-md-0">
                <h5 className="mb-1">{project.title}</h5>
                <p className="mb-0 text-muted small">
                  {project.category} | Priority: {project.priority}
                  {/* ✅ Show client name only if not client role */}
                  {userRole !== "client" && project.clientId?.fullname
                    ? ` | Client: ${project.clientId.fullname}`
                    : ""}
                </p>
              </div>
              <span
                className={`badge bg-${
                  project.status === "completed"
                    ? "success"
                    : project.status === "in progress"
                    ? "warning"
                    : "secondary"
                } px-3 py-2 text-capitalize`}
              >
                {project.status || "Unknown"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
