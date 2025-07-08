import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import "../../styles/employee/DisplayEmployeePage.css";

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
  }, []);

  if (!employee) return <p className="loading">Loading employee details...</p>;

  return (
    <div className="display-employee-container">
      <div className="display-employee-card">
        <h2 className="card-title">Employee Information</h2>
        <div className="card-body">
          <div className="info-row">
            <span className="label">Full Name:</span>
            <span className="value">{employee.fullname}</span>
          </div>
          <div className="info-row">
            <span className="label">Username:</span>
            <span className="value">{employee.username}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{employee.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className={`value ${employee.status}`}>{employee.status || "active"}</span>
          </div>
        </div>
        <div className="action-buttons">
          <button className="edit-btn" onClick={handleEdit}>Edit</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
