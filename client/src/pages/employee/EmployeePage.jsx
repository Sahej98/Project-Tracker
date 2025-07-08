import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import "../../styles/employee/EmployeePage.css";

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

  const openEmployeeDetails = (id) => {
    navigate(`/display-employee/${id}`);
  };

  // Filter employees by name
  const filteredEmployees = employees.filter(employee =>
    employee.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-page">
      <div className="top-bar">
        <h2>Employees</h2>
        <div className="top-actions">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-btn" onClick={() => navigate("/add-employee")}>
            + Add Employee
          </button>
        </div>
      </div>

      <div className="employee-list">
        {filteredEmployees.map((employee) => (
          <div
            key={employee._id}
            className="employee-card"
            onClick={() => openEmployeeDetails(employee._id)}
          >
            <h4>{employee.fullname}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
