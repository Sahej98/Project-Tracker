import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";

export default function DisplayEmployeePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  const fetchEmployee = async () => {
    try {
      const res = await api.get("/users");
      const foundEmployee = res.data.employees.find((e) => e._id === id);
      if (foundEmployee) {
        setEmployee(foundEmployee);
      } else {
        console.error("Employee not found");
      }
    } catch (err) {
      console.error("Error fetching employee", err);
    }
  };

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

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (!employee)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading employee details...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="card-title mb-4">Employee Information</h2>
        <div className="mb-3 row">
          <label className="col-sm-2 col-form-label fw-bold">Full Name:</label>
          <div className="col-sm-10">
            <p className="form-control-plaintext">{employee.fullname}</p>
          </div>
        </div>
        <div className="mb-3 row">
          <label className="col-sm-2 col-form-label fw-bold">Username:</label>
          <div className="col-sm-10">
            <p className="form-control-plaintext">{employee.username}</p>
          </div>
        </div>
        <div className="mb-3 row">
          <label className="col-sm-2 col-form-label fw-bold">Email:</label>
          <div className="col-sm-10">
            <p className="form-control-plaintext">{employee.email}</p>
          </div>
        </div>
        <div className="mb-4 row">
          <label className="col-sm-2 col-form-label fw-bold">Status:</label>
          <div className="col-sm-10">
            <span
              className={`badge ${
                employee.status === "active" ? "bg-success" : "bg-secondary"
              }`}
            >
              {employee.status || "active"}
            </span>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-warning" onClick={handleEdit}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
