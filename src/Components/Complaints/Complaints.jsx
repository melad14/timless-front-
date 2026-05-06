import { useState } from "react";
import "./Complaints.css";
import { submitComplaint, uploadAttachment } from "../../services/complaintService";

const ISSUE_TYPES = [
  { value: "general", label: "General Issue" },
  { value: "bug", label: "Technical Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "performance", label: "Performance Issue" },
  { value: "other", label: "Other" },
];

const SUGGESTION_RATING = [
  { value: 1, icon: "★" },
  { value: 2, icon: "★" },
  { value: 3, icon: "★" },
  { value: 4, icon: "★" },
  { value: 5, icon: "★" },
];

export default function Complaints() {
  // Complaints Tab
  const [complaintIssueType, setComplaintIssueType] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintAttachment, setComplaintAttachment] = useState(null);

  // Suggestions Tab
  const [suggestionRating, setSuggestionRating] = useState(0);
  const [suggestionContent, setSuggestionContent] = useState("");
  const [allowContact, setAllowContact] = useState(false);
  const [suggestionAttachment, setSuggestionAttachment] = useState(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  // Handle Complaint File Upload
  const handleComplaintFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadAttachment(file);
      setComplaintAttachment(uploaded);
      setFeedback({ type: "success", text: "File uploaded successfully" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  };

  // Handle Suggestion File Upload
  const handleSuggestionFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadAttachment(file);
      setSuggestionAttachment(uploaded);
      setFeedback({ type: "success", text: "File uploaded successfully" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  };

  // Submit Complaint
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!complaintIssueType) {
      setFeedback({ type: "error", text: "Please select an issue type" });
      return;
    }

    if (!complaintDescription.trim()) {
      setFeedback({ type: "error", text: "Please describe your problem" });
      return;
    }

    setLoading(true);
    try {
      await submitComplaint({
        type: "complaint",
        issueType: complaintIssueType,
        description: complaintDescription,
        attachmentUrl: complaintAttachment?.name || null,
      });

      setFeedback({
        type: "success",
        text: "Thank you! We've received your complaint and will get back to you soon.",
      });

      // Reset form
      setTimeout(() => {
        setComplaintIssueType("");
        setComplaintDescription("");
        setComplaintAttachment(null);
        setComplaintSubmitted(true);
      }, 1500);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit Suggestion
  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!suggestionRating) {
      setFeedback({ type: "error", text: "Please rate your experience" });
      return;
    }

    if (!suggestionContent.trim()) {
      setFeedback({ type: "error", text: "Please share your suggestion" });
      return;
    }

    setLoading(true);
    try {
      await submitComplaint({
        type: "suggestion",
        issueType: "general",
        description: suggestionContent,
        rating: suggestionRating,
        allowContact,
        attachmentUrl: suggestionAttachment?.name || null,
      });

      setFeedback({
        type: "success",
        text: "Thank you for your suggestion! We appreciate your feedback.",
      });

      // Reset form
      setTimeout(() => {
        setSuggestionRating(0);
        setSuggestionContent("");
        setAllowContact(false);
        setSuggestionAttachment(null);
        setSuggestionSubmitted(true);
      }, 1500);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="complaints-page">
      {feedback.text && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      <div className="complaints-container">
        {/* Complaints Section */}
        <section className="complaints-section">
          <div className="section-card">
            <h2 className="section-title">Complaints</h2>

            <form onSubmit={handleComplaintSubmit}>
              {/* Issue Type Dropdown */}
              <div className="form-group">
                <select
                  className="issue-dropdown"
                  value={complaintIssueType}
                  onChange={(e) => setComplaintIssueType(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Issue Type</option>
                  {ISSUE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Attachment Button */}
              <div className="form-group">
                <label htmlFor="complaint-file" className="upload-button-label">
                  <input
                    id="complaint-file"
                    type="file"
                    onChange={handleComplaintFileUpload}
                    disabled={loading}
                    style={{ display: "none" }}
                  />
                  <span className="upload-button">Upload Attachment</span>
                </label>
                {complaintAttachment && (
                  <p className="file-info">📎 {complaintAttachment.name}</p>
                )}
              </div>

              {/* Description Textarea */}
              <div className="form-group">
                <textarea
                  className="description-textarea"
                  placeholder="Describe Your Problem..."
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  disabled={loading}
                  rows={6}
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>

            <p className="footer-text">✉ We'll Get Back To You Soon</p>
          </div>
        </section>

        {/* Suggestions Section */}
        <section className="suggestions-section">
          <div className="section-card">
            <h2 className="section-title">Suggestions</h2>

            <form onSubmit={handleSuggestionSubmit}>
              {/* Star Rating */}
              <div className="form-group">
                <div className="star-rating">
                  {SUGGESTION_RATING.map((star) => (
                    <button
                      key={star.value}
                      type="button"
                      className={`star ${
                        suggestionRating >= star.value ? "filled" : ""
                      }`}
                      onClick={() => setSuggestionRating(star.value)}
                      disabled={loading}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestion Textarea */}
              <div className="form-group">
                <textarea
                  className="description-textarea"
                  placeholder="Share Your Idea To Make Timeless Better..."
                  value={suggestionContent}
                  onChange={(e) => setSuggestionContent(e.target.value)}
                  disabled={loading}
                  rows={5}
                />
              </div>

              {/* Contact Permission Checkbox */}
              <div className="form-group checkbox-group">
                <input
                  id="allow-contact"
                  type="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="allow-contact" className="checkbox-label">
                  Allow The Team To Contact Me
                </label>
              </div>

              {/* Upload Attachment Button */}
              <div className="form-group">
                <label htmlFor="suggestion-file" className="upload-button-label">
                  <input
                    id="suggestion-file"
                    type="file"
                    onChange={handleSuggestionFileUpload}
                    disabled={loading}
                    style={{ display: "none" }}
                  />
                  <span className="upload-button">Upload Attachment</span>
                </label>
                {suggestionAttachment && (
                  <p className="file-info">📎 {suggestionAttachment.name}</p>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Suggestion"}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Review Or Comment Section */}
      <section className="review-section">
        <h3 className="review-title">Review Or Comment</h3>
        <p className="review-subtitle">
          We value your feedback. Let us know what you think about Timeless!
        </p>
      </section>
    </main>
  );
}
