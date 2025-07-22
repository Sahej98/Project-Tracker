import React, { useEffect, useState } from 'react';
import api from '../../axios';

export default function ReportPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupedReports, setGroupedReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, [date]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/daily-tasks/admin/reports?date=${date}`);
      setGroupedReports(res.data.grouped);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in progress': return '#FFC107';
      case 'pending': return '#9E9E9E';
      default: return '#607D8B';
    }
  };

  return (
    <div className="container-fluid py-3 px-1 px-md-5">
      <div className="mb-4">
        <h2 className="fw-semibold text-dark mb-3">Daily Task Reports</h2>

        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search employee by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-md-4 text-md-end">
            <button
              className="btn btn-primary px-4"
              onClick={fetchReports}
            >
              <i className="bi bi-arrow-clockwise me-2"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Loading reports...</p>
        </div>
      ) : Object.keys(groupedReports).length === 0 ? (
        <p className="text-muted text-center">No reports found for <strong>{date}</strong>.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {Object.entries(groupedReports)
            .filter(([employee]) => employee.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(([employee, projects]) => (
              <div
                key={employee}
                className="p-3 rounded shadow-sm bg-white border"
              >
                <h4 className="fw-semibold text-primary mb-3">
                  <i className="bi bi-person-circle me-2"></i> {employee}
                </h4>

                <div className="d-flex flex-column gap-3">
                  {Object.entries(projects).map(([project, tasks]) => (
                    <div key={project} className="p-3 rounded bg-light">
                      <h6 className="fw-semibold mb-3 text-dark">
                        <i className="bi bi-folder-fill text-warning me-2"></i> {project}
                      </h6>

                      {Object.entries(tasks).map(([task, subtasks]) => (
                        <div key={task} className="p-2 rounded bg-white border mb-2">
                          <strong className="d-block mb-2 text-dark">{task}</strong>

                          <div className="d-flex flex-column gap-2">
                            {subtasks.map((sub, idx) => (
                              <div
                                key={idx}
                                className="d-flex justify-content-between align-items-center p-2 rounded bg-light border"
                              >
                                <div>
                                  <div className="fw-medium">{sub.subtaskTitle || 'Untitled Subtask'}</div>
                                  <small className="text-muted">
                                    ⏱ {sub.timeSpent || '-'} | {sub.remarks || 'No remarks'}
                                  </small>
                                </div>
                                <span style={{
                                  backgroundColor: getStatusColor(sub.status),
                                  color: '#fff',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  textTransform: 'capitalize',
                                  minWidth: '80px',
                                  textAlign: 'center'
                                }}>
                                  {sub.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
