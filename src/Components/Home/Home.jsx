import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCapsule } from "../../services/capsuleService";
import { isAuthenticated, getStoredUser } from "../../services/authService";
import { createConversation } from "../../services/conversationService";
import { sendMessage } from "../../services/messageService";
import homeVisual from "../../assets/images/Home.png";
import "./Home.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [recipients, setRecipients] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [hasReminder, setHasReminder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const minDateValue = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!message.trim()) {
      setFeedback({ type: "error", text: "Please write your message first." });
      return;
    }

    if (!openDate) {
      setFeedback({ type: "error", text: "Please choose a valid delivery date." });
      return;
    }

    setLoading(true);
    try {
      const recipientList = recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email !== "");

      // Create time capsule
      await createCapsule({
        content: message.trim(),
        openDate: new Date(openDate).toISOString(),
        recipients: recipientList,
      });

      // Also create conversation and message for Sent folder visibility
      try {
        const title = `📋 Message: ${message.trim().substring(0, 30)}...`;
        const conv = await createConversation({
          title,
          member_ids: [],
        });

        await sendMessage({
          conversation_id: conv.id,
          content: message.trim(),
          content_type: "text",
        });
      } catch (e) {
        // If conversation creation fails, just log it (time capsule was already created)
        console.warn("Could not create conversation for message history:", e.message);
      }

      setFeedback({
        type: "success",
        text: hasReminder
          ? "Message saved. We will remind you before delivery."
          : "Message saved successfully.",
      });
      setMessage("");
      setOpenDate("");
      setRecipients("");
      setMobileNumber("");
      setIsHidden(true);
      setHasReminder(false);
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Unable to save message." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="home-page">
      <section className="home-content">
        <div className="home-left">
          <h1 className="home-title">Write A Message</h1>
          <form className="message-form" onSubmit={handleSubmit}>
            <textarea
              className="message-input"
              placeholder="Type Your Message Here....."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              disabled={loading}
            />

            <h2 className="home-title date-title">Choose The Date</h2>
            <input
              type="datetime-local"
              className="date-input"
              value={openDate}
              min={minDateValue}
              onChange={(event) => setOpenDate(event.target.value)}
              disabled={loading}
            />

            <input
              type="tel"
              className="date-input"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              disabled={loading}
            />

            <h2 className="home-title date-title">Recipient Emails</h2>
            <input
              type="text"
              className="date-input"
              placeholder="Enter emails separated by commas (e.g. child1@mail.com, child2@mail.com)"
              value={recipients}
              onChange={(event) => setRecipients(event.target.value)}
              disabled={loading}
            />

            <label className="check-item">
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(event) => setIsHidden(event.target.checked)}
                disabled={loading}
              />
              <span>Keep The Message Hidden Until The Selected Date</span>
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={hasReminder}
                onChange={(event) => setHasReminder(event.target.checked)}
                disabled={loading}
              />
              <span>Get A Reminder Before The Delivery</span>
            </label>

            {feedback.text ? (
              <p className={`form-feedback ${feedback.type}`}>{feedback.text}</p>
            ) : null}

            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Saving..." : "Save Message"}
            </button>
          </form>
        </div>

        <div className="home-right">
          <h2 className="quote-text">
            &ldquo;A Message Today
            <br />
            Becomes A Memory
            <br />
            Tomorrow&rdquo;
          </h2>
          <img src={homeVisual} alt="Timeless visual" className="home-visual" />
        </div>
      </section>
    </main>
  );
}
