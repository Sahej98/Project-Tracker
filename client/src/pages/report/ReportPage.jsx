import React, { useEffect, useState } from 'react';
import api from '../../axios'; // ✅ Use your custom axios wrapper

const ReportPage = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupedReports, setGroupedReports] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/daily-task/admin/reports?date=${date}`);
      setGroupedReports(res.data.grouped);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [date]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Daily Task Reports</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Select Date:{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button onClick={fetchReports} style={{ marginLeft: "10px" }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : Object.keys(groupedReports).length === 0 ? (
        <p>No reports found for {date}.</p>
      ) : (
        Object.entries(groupedReports).map(([employee, projects]) => (
          <div key={employee} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
            <h2>👤 {employee}</h2>

            {Object.entries(projects).map(([project, tasks]) => (
              <div key={project} style={{ marginLeft: "20px" }}>
                <h3>📁 {project}</h3>

                {Object.entries(tasks).map(([task, subtasks]) => (
                  <div key={task} style={{ marginLeft: "20px", marginBottom: "10px" }}>
                    <strong>🗂️ {task}</strong>
                    <ul>
                      {subtasks.map((sub, idx) => (
                        <li key={idx}>
                          {sub.subtaskTitle} - <b>{sub.status}</b> - Remarks: {sub.remarks}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default ReportPage;
