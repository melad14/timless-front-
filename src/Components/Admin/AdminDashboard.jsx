import { useEffect, useState } from "react";
import { request } from "../../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ticket detail and chat states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replying, setReplying] = useState(false);

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

  const handleSelectComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText("");
    setReplyError("");
    await fetchMessages(complaint.conversation_id);
  };

  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const data = await request(`/messages/conversation/${conversationId}`);
      setMessages(data);
    } catch (err) {
      setReplyError("Failed to load message thread");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || replying) return;

    try {
      setReplying(true);
      setReplyError("");
      await request("/messages", {
        method: "POST",
        body: JSON.stringify({
          conversation_id: selectedComplaint.conversation_id,
          content: replyText,
          content_type: "text",
          metadata: {
            submittedAt: new Date().toISOString(),
          },
        }),
      });
      setReplyText("");
      // Refresh messages after sending
      await fetchMessages(selectedComplaint.conversation_id);
    } catch (err) {
      setReplyError(err.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>لوحة تحكم الدعم والشكاوى (Complaints & Suggestions)</h1>
        <button onClick={fetchComplaints} className="refresh-btn">تحديث</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-layout">
        {loading ? (
          <div className="admin-loading">جاري تحميل الشكاوى والاقتراحات...</div>
        ) : (
          <div className={`complaints-side ${selectedComplaint ? "split" : "full"}`}>
            {complaints.length === 0 ? (
              <p className="no-complaints">لا توجد شكاوى أو اقتراحات حالياً.</p>
            ) : (
              <div className="complaints-grid">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className={`complaint-card ${c.metadata?.type} ${
                      selectedComplaint?.id === c.id ? "active-card" : ""
                    }`}
                    onClick={() => handleSelectComplaint(c)}
                  >
                    <div className="card-header">
                      <span className="type-badge">{c.metadata?.type === "suggestion" ? "💡 اقتراح" : "⚠️ شكوى"}</span>
                      <span className="date">{new Date(c.created_at).toLocaleString("ar-EG")}</span>
                    </div>
                    <div className="card-body">
                      <p className="issue-title"><strong>النوع:</strong> {c.metadata?.issueType}</p>
                      <p className="issue-desc"><strong>المحتوى الأساسي:</strong> {c.content.substring(0, 100)}{c.content.length > 100 ? "..." : ""}</p>
                      {c.metadata?.rating > 0 && <p><strong>التقييم:</strong> {c.metadata.rating} / 5</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedComplaint && (
          <div className="complaint-chat-pane">
            <div className="chat-pane-header">
              <div className="header-info">
                <h3>تفاصيل الشكوى / الاقتراح</h3>
                <span className="user-id">المستخدم: {selectedComplaint.sender_id}</span>
              </div>
              <button className="close-pane-btn" onClick={() => setSelectedComplaint(null)}>✕ إغلاق</button>
            </div>

            <div className="ticket-details-summary">
              <p><strong>الموضوع الأساسي:</strong> {selectedComplaint.metadata?.issueType}</p>
              <p><strong>تاريخ الإرسال:</strong> {new Date(selectedComplaint.created_at).toLocaleString("ar-EG")}</p>
              {selectedComplaint.metadata?.rating > 0 && (
                <p><strong>التقييم:</strong> {"★".repeat(selectedComplaint.metadata.rating)}</p>
              )}
              {selectedComplaint.metadata?.allowContact && (
                <p className="contact-alert">✓ يوافق على التواصل معه مباشرة</p>
              )}
              {selectedComplaint.metadata?.attachmentUrl && (
                <p>
                  <strong>المرفقات:</strong>{" "}
                  <a
                    href={selectedComplaint.metadata.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-link"
                  >
                    عرض الملف المرفق
                  </a>
                </p>
              )}
            </div>

            <div className="chat-messages-container">
              {messagesLoading ? (
                <div className="messages-loading">جاري تحميل سجل المحادثة...</div>
              ) : (
                <div className="messages-list">
                  {/* First message is the complaint content itself */}
                  <div className="message-bubble client-bubble initial-msg">
                    <div className="msg-sender">العميل (الشكوى الأساسية)</div>
                    <div className="msg-content">{selectedComplaint.content}</div>
                    <div className="msg-time">{new Date(selectedComplaint.created_at).toLocaleTimeString("ar-EG")}</div>
                  </div>

                  {/* Rest of conversation messages */}
                  {messages
                    .filter((msg) => msg.id !== selectedComplaint.id) // Skip the first one if already rendered
                    .map((msg) => {
                      const isClient = msg.sender_id === selectedComplaint.sender_id;
                      return (
                        <div
                          key={msg.id}
                          className={`message-bubble ${isClient ? "client-bubble" : "admin-bubble"}`}
                        >
                          <div className="msg-sender">{isClient ? "العميل" : "الدعم الفني (أنت)"}</div>
                          <div className="msg-content">{msg.content}</div>
                          <div className="msg-time">
                            {new Date(msg.created_at).toLocaleString("ar-EG")}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <form onSubmit={handleSendReply} className="chat-reply-form">
              {replyError && <div className="reply-error">{replyError}</div>}
              <div className="reply-input-wrapper">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا للعميل..."
                  disabled={replying}
                  rows={3}
                  required
                />
                <button type="submit" disabled={replying || !replyText.trim()} className="send-reply-btn">
                  {replying ? "جاري الإرسال..." : "إرسال الرد"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
