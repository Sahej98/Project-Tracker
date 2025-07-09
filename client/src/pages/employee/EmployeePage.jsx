// src/pages/employees/EmployeePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get("/users");
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error("Error loading employees", err);
      }
    }
    fetch();
  }, []);

  const filtered = employees.filter((e) =>
    e.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Employees</h3>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ maxWidth: "300px" }}
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => navigate("/add-employee")}>
            + Add
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((e) => (
            <div
              key={e._id}
              className="card p-3 shadow-sm d-flex flex-md-row justify-content-between align-items-center"
              onClick={() => navigate(`/display-employee/${e._id}`)}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h5>{e.fullname}</h5>
                <small className="text-muted">{e.email}</small>
              </div>
              <span className={`badge bg-${e.status === "active" ? "success" : "secondary"}`}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
