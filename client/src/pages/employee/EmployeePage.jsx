import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/users");
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    employee.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEmployeeDetails = (id) => {
    navigate(`/display-employee/${id}`);
  };

  return (
    <div className="container-fluid py-3 px-1 px-md-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-semibold text-dark mb-3">Employees</h2>

        <div className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search employees by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-8 text-md-end">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/add-employee")}
            >
              + Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employees List */}
      {filteredEmployees.length === 0 ? (
        <p className="text-muted text-center">No employees found.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee._id}
              className="d-flex card shadow flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3 rounded shadow-sm bg-white hover-shadow transition"
              style={{ cursor: "pointer" }}
              onClick={() => openEmployeeDetails(employee._id)}
            >
              <div className="mb-2 mb-md-0">
                <h5 className="mb-1">{employee.fullname}</h5>
                <p className="mb-0 text-muted small">
                  {employee.email || "No email provided"}
                </p>
              </div>
              <span
                className={`badge bg-${
                  employee.status === "active" ? "success" : "secondary"
                } px-3 py-2 text-capitalize`}
              >
                {employee.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
