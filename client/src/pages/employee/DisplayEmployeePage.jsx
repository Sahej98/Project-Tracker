import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function DisplayEmployeePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get("/users");
        const foundEmployee = res.data.employees.find((c) => c._id === id);
        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          console.error("Employee not found");
        }
      } catch (err) {
        console.error("Error fetching employee", err);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/users/${id}`);
        navigate("/display-employees");
      } catch (err) {
        console.error("Failed to delete employee", err);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-employee/${id}`);
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  if (!employee) {
    return (
      <div className="container mt-4">
        <p>Loading employee details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2" style={{ backgroundColor: "#f8f9fa"}}>
      <div className="bg-white shadow-sm rounded-4 p-4 w-100 card shadow">
        <h3 className="mb-4 border-bottom pb-2">Employee Details</h3>

        <DetailRow label="Full Name" value={employee.fullname} />
        <DetailRow label="Username" value={employee.username} />
        <DetailRow label="Email" value={employee.email || "N/A"} />
        <DetailRow
          label="Status"
          value={
            <span className={`badge px-3 py-1 bg-${employee.status === "active" ? "success" : "secondary"}`}>
              {employee.status}
            </span>
          }
        />

        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-outline-primary" onClick={handleEdit}>Edit</button>
          <button className="btn btn-outline-danger" onClick={handleDelete}>Delete</button>
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
      <div className="col-sm-6 text-end fw-semibold text-dark">
        {value}
      </div>
    </div>
  );
}
