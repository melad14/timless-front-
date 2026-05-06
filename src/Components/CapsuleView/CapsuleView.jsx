import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedCapsule } from "../../services/capsuleService";
import "./CapsuleView.css";

export default function CapsuleView() {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCapsule() {
      try {
        const data = await getSharedCapsule(id);
        setCapsule(data);
      } catch (err) {
        setError(err.message || "Unable to load the message. It might not be open yet.");
      } finally {
        setLoading(false);
      }
    }
    loadCapsule();
  }, [id]);

  if (loading) {
    return (
      <div className="capsule-view-container">
        <div className="capsule-card loading">
          <div className="spinner"></div>
          <p>Unlocking your message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="capsule-view-container">
        <div className="capsule-card error">
          <div className="error-icon">🔒</div>
          <h2>Access Restricted</h2>
          <p>{error}</p>
          <p className="hint">Time capsules are only visible after their scheduled delivery date.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="capsule-view-container">
      <div className="capsule-card opened">
        <div className="capsule-header">
          <span className="capsule-icon">✉️</span>
          <h1 className="capsule-title">{capsule.title}</h1>
          <p className="capsule-sender">From: {capsule.user?.username || "Someone who cares"}</p>
        </div>
        <div className="capsule-content">
          <p className="message-text">{capsule.content}</p>
        </div>
        <div className="capsule-footer">
          <p className="delivery-date">
            Delivered on: {new Date(capsule.open_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <div className="brand">Timeless</div>
        </div>
      </div>
    </div>
  );
}
