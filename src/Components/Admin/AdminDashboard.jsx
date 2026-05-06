import { useEffect, useState } from "react";
import { request } from "../../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await request("/admin/complaints");
      setComplaints(data);
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard - Complaints & Suggestions</h1>
        <button onClick={fetchComplaints} className="refresh-btn">Refresh</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading complaints...</div>
      ) : (
        <div className="complaints-list">
          {complaints.length === 0 ? (
            <p>No complaints or suggestions found.</p>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className={`complaint-card ${c.metadata?.type}`}>
                <div className="card-header">
                  <span className="type-badge">{c.metadata?.type?.toUpperCase()}</span>
                  <span className="date">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <div className="card-body">
                  <p><strong>Issue:</strong> {c.metadata?.issueType}</p>
                  <p><strong>Content:</strong> {c.content}</p>
                  {c.metadata?.rating > 0 && <p><strong>Rating:</strong> {c.metadata.rating} / 5</p>}
                  {c.metadata?.attachmentUrl && (
                    <p><strong>Attachment:</strong> <a href="#">{c.metadata.attachmentUrl}</a></p>
                  )}
                  <p><strong>Sender ID:</strong> {c.sender_id}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
