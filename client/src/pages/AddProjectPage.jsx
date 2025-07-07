import ProjectForm from "../components/ProjectForm";
import "../styles/AddProjectPage.css";

export default function AddProjectPage() {
  return (
    <div className="new-project-cont">
      <h2>Add New Project</h2>
      <ProjectForm />
    </div>
  );
}
