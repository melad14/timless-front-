import { useCallback, useEffect, useMemo, useState } from "react";
import "./Messages.css";
import { createCapsule } from "../../services/capsuleService";
import { getStoredUser } from "../../services/authService";
import { listConversations, createConversation } from "../../services/conversationService";
import {
  getMessagesForConversation,
  getFavoriteMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  toggleMessageFavorite,
  markMessageRead,
  getSentMessages,
} from "../../services/messageService";

const FOLDER = { INBOX: "inbox", SENT: "sent", FAVORITES: "favorites" };

function normalizeMessageList(res) {
  if (Array.isArray(res)) return res;
  if (res?.messages && Array.isArray(res.messages)) return res.messages;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

function getSenderId(m) {
  const id = m.sender_id ?? m.user_id ?? m.author_id ?? m.from_user_id ?? m.created_by ?? null;
  return id;
}

function isFavoriteFlag(m) {
  return Boolean(m.is_favorite ?? m.favorite ?? m.isFavorite);
}

function guessCategory(title, content) {
  const t = `${title || ""} ${content || ""}`.toLowerCase();
  if (t.includes("birthday")) return "Birthday Message";
  if (t.includes("graduation")) return "Graduation Message";
  if (t.includes("wedding")) return "Wedding Anniversary";
  if (t.includes("future")) return "Future Message";
  if (t.includes("reminder")) return "Personal Reminder";
  if (t.includes("appreciation")) return "Appreciation Letter";
  return "Message";
}

function ensureUTC(iso) {
  if (!iso) return iso;
  if (typeof iso !== "string") return iso;
  // If it doesn't have Z or a timezone offset (+/-), append Z to treat it as UTC
  if (!iso.includes("Z") && !/[+-]\d{2}:\d{2}$/.test(iso)) {
    return `${iso}Z`;
  }
  return iso;
}

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    const date = new Date(ensureUTC(iso));
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

function formatDateTime(iso) {
  if (!iso) return "";
  try {
    const date = new Date(ensureUTC(iso));
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour format for better readability
    }).format(date);
  } catch {
    return "";
  }
}

function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.ceil((target - now) / (86400000));
  return diff;
}

function displayNameForConversation(c) {
  return c?.title?.trim() || `Chat ${String(c?.id || "").slice(-6)}`;
}

export default function Messages() {
  const me = getStoredUser();
  const myId = me?.id ? String(me.id) : null;

  const [folder, setFolder] = useState(FOLDER.INBOX);
  const [conversations, setConversations] = useState([]);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const [sentRows, setSentRows] = useState([]);
  const [messagesByConv, setMessagesByConv] = useState({});
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [selectedFavoriteMsg, setSelectedFavoriteMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [mobileView, setMobileView] = useState("list");

  const [composeTitle, setComposeTitle] = useState("");
  const [composeMembers, setComposeMembers] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeOpenDate, setComposeOpenDate] = useState("");
  const [composeRecipients, setComposeRecipients] = useState("");
  const [composeMobileNumber, setComposeMobileNumber] = useState("");
  const [composeIsHidden, setComposeIsHidden] = useState(true);
  const [composeHasReminder, setComposeHasReminder] = useState(false);
  const [composeBusy, setComposeBusy] = useState(false);

  const [replyBody, setReplyBody] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  const loadConversations = useCallback(async () => {
    const list = await listConversations(0, 50);
    setConversations(list);
  }, []);

  const loadFavorites = useCallback(async () => {
    const list = await getFavoriteMessages(0, 50);
    setFavoriteMessages(list);
  }, []);

  const loadSent = useCallback(async () => {
    if (!myId) {
      setSentRows([]);
      return;
    }
    setLoading(true);
    try {
      const msgs = await getSentMessages(0, 50);
      // We still need conversation info for some UI parts, 
      // but for now let's just create a mock conversation object if missing
      // or fetch it if needed. For simplicity, we'll map the messages to rows.
      const rows = msgs.map(m => ({
        conversation: { id: m.conversation_id, title: "Message" },
        message: m
      }));
      setSentRows(rows);
    } catch (err) {
      console.error("loadSent: Error loading sent messages:", err.message);
      setSentRows([]);
    } finally {
      setLoading(false);
    }
  }, [myId]);

  const refreshFolder = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (folder === FOLDER.INBOX) {
        await loadConversations();
      } else if (folder === FOLDER.FAVORITES) {
        await loadFavorites();
      } else if (folder === FOLDER.SENT) {
        await loadSent();
      }
      
      // Auto-trigger delivery check in background
      try {
        fetch(`${process.env.REACT_APP_API_URL || "https://timeless-lemon.vercel.app/api/v1"}/time-capsules/check-ready`, {
          method: 'POST',
        }).catch(() => {}); // Silent catch
      } catch (e) { /* ignore */ }
    } catch (e) {
      setError(e.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [folder, loadConversations, loadFavorites, loadSent]);

  useEffect(() => {
    refreshFolder();
  }, [refreshFolder]);

  const loadConvMessages = async (convId) => {
    const raw = await getMessagesForConversation(convId, 0, 50);
    const msgs = normalizeMessageList(raw);
    setMessagesByConv((prev) => ({ ...prev, [convId]: msgs }));
    return msgs;
  };

  useEffect(() => {
    if (loading || folder !== FOLDER.INBOX || !conversations.length) return undefined;
    let cancelled = false;
    const slice = conversations.slice(0, 20);
    (async () => {
      await Promise.all(
        slice.map(async (c) => {
          if (cancelled) return;
          try {
            const raw = await getMessagesForConversation(c.id, 0, 50);
            const msgs = normalizeMessageList(raw);
            setMessagesByConv((prev) => {
              if (prev[c.id]) return prev;
              return { ...prev, [c.id]: msgs };
            });
          } catch {
            /* ignore */
          }
        })
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, folder, conversations]);

  const selectConversation = async (convId) => {
    setSelectedConvId(convId);
    setSelectedFavoriteMsg(null);
    setSelectedMessageId(null);
    setEditing(false);
    setMobileView("detail");
    try {
      const msgs = await loadConvMessages(convId);
      if (!msgs.length) return;
      const last = msgs[msgs.length - 1];
      const incoming = [...msgs].reverse().find((m) => String(getSenderId(m)) !== String(myId));
      const pick = incoming || last;
      setSelectedMessageId(pick.id);
      setEditContent(pick.content || "");
      try {
        await markMessageRead(pick.id);
      } catch {
        /* optional */
      }
    } catch (e) {
      setError(e.message || "Could not load conversation.");
    }
  };

  const selectSentRow = async (row) => {
    setSelectedConvId(row.conversation.id);
    setSelectedFavoriteMsg(null);
    setSelectedMessageId(row.message.id);
    setEditContent(row.message.content || "");
    setMobileView("detail");
    try {
      await loadConvMessages(row.conversation.id);
    } catch {
      /* ignore */
    }
  };

  const selectFavorite = (msg) => {
    setSelectedFavoriteMsg(msg);
    setSelectedConvId(null);
    setSelectedMessageId(msg.id);
    setEditContent(msg.content || "");
    setEditing(false);
    setMobileView("detail");
  };

  const currentMessages = useMemo(() => {
    return selectedConvId ? messagesByConv[selectedConvId] || [] : [];
  }, [selectedConvId, messagesByConv]);
  const selectedMessage = useMemo(() => {
    if (folder === FOLDER.FAVORITES && selectedFavoriteMsg) return selectedFavoriteMsg;
    if (!selectedMessageId) return null;
    if (folder === FOLDER.SENT) {
      const row = sentRows.find((r) => String(r.message.id) === String(selectedMessageId));
      return row?.message || null;
    }
    return currentMessages.find((m) => String(m.id) === String(selectedMessageId)) || null;
  }, [
    folder,
    selectedFavoriteMsg,
    selectedMessageId,
    currentMessages,
    sentRows,
  ]);

  const selectedConversation = useMemo(() => {
    if (!selectedConvId) return null;
    return conversations.find((c) => String(c.id) === String(selectedConvId)) || null;
  }, [conversations, selectedConvId]);

  const detailName = useMemo(() => {
    if (folder === FOLDER.FAVORITES && selectedFavoriteMsg) {
      return selectedFavoriteMsg.sender_name || selectedFavoriteMsg.username || "Contact";
    }
    if (selectedConversation) return displayNameForConversation(selectedConversation);
    if (folder === FOLDER.SENT && selectedMessage) {
      const row = sentRows.find((r) => String(r.message.id) === String(selectedMessage.id));
      if (row) return displayNameForConversation(row.conversation);
    }
    return "Message";
  }, [
    folder,
    selectedFavoriteMsg,
    selectedConversation,
    selectedMessage,
    sentRows,
  ]);

  const category = useMemo(() => {
    const title = selectedConversation?.title || "";
    const content = selectedMessage?.content || "";
    return guessCategory(title, content);
  }, [selectedConversation, selectedMessage]);

  const scheduleIso =
    selectedMessage?.scheduled_at ||
    selectedMessage?.schedule_at ||
    selectedMessage?.deliver_at ||
    selectedMessage?.open_date ||
    selectedMessage?.updated_at ||
    selectedMessage?.created_at;

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = displayNameForConversation(c).toLowerCase();
      const msgs = messagesByConv[c.id];
      const inMsgs =
        msgs &&
        msgs.some((m) => (m.content || "").toLowerCase().includes(q));
      return name.includes(q) || inMsgs;
    });
  }, [conversations, search, messagesByConv]);

  const filteredFavorites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return favoriteMessages;
    return favoriteMessages.filter(
      (m) =>
        (m.content || "").toLowerCase().includes(q) ||
        String(m.id).includes(q)
    );
  }, [favoriteMessages, search]);

  const filteredSent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sentRows;
    return sentRows.filter((r) => {
      const name = displayNameForConversation(r.conversation).toLowerCase();
      return (
        name.includes(q) ||
        (r.message.content || "").toLowerCase().includes(q)
      );
    });
  }, [sentRows, search]);

  const handleToggleFavorite = async (e, msg) => {
    e?.stopPropagation?.();
    if (!msg?.id) return;
    try {
      await toggleMessageFavorite(msg.id);
      await refreshFolder();
      if (selectedConvId) {
        const raw = await getMessagesForConversation(selectedConvId, 0, 50);
        setMessagesByConv((prev) => ({
          ...prev,
          [selectedConvId]: normalizeMessageList(raw),
        }));
      }
    } catch (err) {
      setError(err.message || "Could not update favorite.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage?.id) return;
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(selectedMessage.id);
      setSelectedMessageId(null);
      setSelectedFavoriteMsg(null);
      setSelectedConvId(null);
      setMessagesByConv({});
      setMobileView("list");
      await refreshFolder();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMessage?.id) return;
    try {
      await updateMessage(selectedMessage.id, editContent);
      setEditing(false);
      await refreshFolder();
      if (selectedConvId) {
        const raw = await getMessagesForConversation(selectedConvId, 0, 50);
        setMessagesByConv((prev) => ({
          ...prev,
          [selectedConvId]: normalizeMessageList(raw),
        }));
      }
    } catch (err) {
      setError(err.message || "Update failed.");
    }
  };

  const handleReplySend = async () => {
    if (!replyBody.trim() || !selectedConvId) return;
    setReplyBusy(true);
    try {
      await sendMessage({
        conversation_id: selectedConvId,
        content: replyBody.trim(),
        content_type: "text",
      });
      setReplyOpen(false);
      setReplyBody("");
      const raw = await getMessagesForConversation(selectedConvId, 0, 50);
      setMessagesByConv((prev) => ({
        ...prev,
        [selectedConvId]: normalizeMessageList(raw),
      }));
      // Refresh Sent folder if currently viewing it
      if (folder === FOLDER.SENT) {
        await loadSent();
      }
    } catch (err) {
      setError(err.message || "Reply failed.");
    } finally {
      setReplyBusy(false);
    }
  };

  const handleCompose = async () => {
    if (!composeBody.trim()) {
      setError("Please write your message first.");
      return;
    }
    if (!composeOpenDate) {
      setError("Please choose a valid delivery date.");
      return;
    }

    setComposeBusy(true);
    setError("");
    try {
      const recipientList = composeRecipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email !== "");

      // Create time capsule
      await createCapsule({
        content: composeBody.trim(),
        openDate: new Date(composeOpenDate).toISOString(),
        recipients: recipientList,
      });

      // Also create conversation and message for history
      try {
        const title = composeTitle.trim() || `📋 Message: ${composeBody.trim().substring(0, 30)}...`;
        const ids = composeMembers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const conv = await createConversation({
          title,
          member_ids: ids,
        });

        await sendMessage({
          conversation_id: conv.id,
          content: composeBody.trim(),
          content_type: "text",
          scheduled_at: new Date(composeOpenDate).toISOString(),
        });

        await loadConversations();
        await loadSent();
        await selectConversation(conv.id);
      } catch (e) {
        console.warn("Could not create conversation for message history:", e.message);
      }

      setComposeOpen(false);
      setComposeTitle("");
      setComposeMembers("");
      setComposeBody("");
      setComposeOpenDate("");
      setComposeRecipients("");
      setComposeMobileNumber("");
      setComposeIsHidden(true);
      setComposeHasReminder(false);
    } catch (err) {
      setError(err.message || "Could not create message.");
    } finally {
      setComposeBusy(false);
    }
  };

  const sentCount = sentRows.length;
  const untilDays = daysUntil(scheduleIso);
  const isOwnMessage =
    selectedMessage && myId && String(getSenderId(selectedMessage)) === String(myId);

  return (
    <div className="message-page">
      <div className="message-page-inner">
        {error ? <div className="message-error">{error}</div> : null}
        {loading ? <div className="message-loading">Loading…</div> : null}

        <aside
          className={`message-sidebar ${mobileView === "detail" ? "mobile-hidden" : ""}`}
        >
          <button type="button" className="btn-new-message" onClick={() => setComposeOpen(true)}>
            <span aria-hidden>✉</span> New Message
          </button>
          <nav className="sidebar-nav" aria-label="Message folders">
            <button
              type="button"
              className={folder === FOLDER.INBOX ? "active" : ""}
              onClick={() => {
                setFolder(FOLDER.INBOX);
                setSelectedConvId(null);
                setSelectedMessageId(null);
                setSelectedFavoriteMsg(null);
                setMobileView("list");
              }}
            >
              <span className="nav-icon">📥</span> Inbox
            </button>
            <button
              type="button"
              className={folder === FOLDER.SENT ? "active" : ""}
              onClick={() => {
                setFolder(FOLDER.SENT);
                setSelectedConvId(null);
                setSelectedMessageId(null);
                setSelectedFavoriteMsg(null);
                setMobileView("list");
              }}
            >
              <span className="nav-icon">✈</span> Sent Message
              {sentCount > 0 ? <span className="sidebar-badge">{sentCount}</span> : null}
            </button>
            <button
              type="button"
              className={folder === FOLDER.FAVORITES ? "active" : ""}
              onClick={() => {
                setFolder(FOLDER.FAVORITES);
                setSelectedConvId(null);
                setSelectedMessageId(null);
                setSelectedFavoriteMsg(null);
                setMobileView("list");
              }}
            >
              <span className="nav-icon">♥</span> Favorite
            </button>
          </nav>
        </aside>

        <section
          className={`message-list-col ${mobileView === "detail" ? "mobile-hidden" : ""}`}
        >
          <div className="message-search">
            <div className="message-search-wrap">
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search messages"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          <div className="message-list-scroll">
            {folder === FOLDER.INBOX &&
              filteredConversations.map((c) => {
                const msgs = messagesByConv[c.id] || [];
                const last = msgs.length ? msgs[msgs.length - 1] : null;
                const preview = last?.content || "Open to load messages";
                const cat = guessCategory(c.title, preview);
                const dateLabel = last
                  ? `Delivers : ${formatShortDate(last.scheduled_at || last.created_at)}`
                  : "Tap to open";
                const selected = String(selectedConvId) === String(c.id);
                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    className={`message-row ${selected ? "selected" : ""}`}
                    onClick={() => selectConversation(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectConversation(c.id);
                    }}
                  >
                    <div className="message-avatar">
                      {displayNameForConversation(c).charAt(0).toUpperCase()}
                    </div>
                    <div className="message-row-meta">
                      <div className="message-row-name">{displayNameForConversation(c)}</div>
                      <div className="message-row-category">{cat}</div>
                      <div className="message-row-date">{dateLabel}</div>
                    </div>
                    {last ? (
                      <button
                        type="button"
                        className="btn-favorite-row"
                        title="Toggle favorite"
                        onClick={(e) => handleToggleFavorite(e, last)}
                      >
                        {isFavoriteFlag(last) ? "♥" : "♡"}
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}

            {folder === FOLDER.SENT &&
              filteredSent.map((row) => {
                const selected = String(selectedMessageId) === String(row.message.id);
                const cat = guessCategory(row.conversation.title, row.message.content);
                return (
                  <div
                    key={`${row.conversation.id}-${row.message.id}`}
                    role="button"
                    tabIndex={0}
                    className={`message-row ${selected ? "selected" : ""}`}
                    onClick={() => selectSentRow(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectSentRow(row);
                    }}
                  >
                    <div className="message-avatar">
                      {displayNameForConversation(row.conversation).charAt(0).toUpperCase()}
                    </div>
                    <div className="message-row-meta">
                      <div className="message-row-name">
                        {displayNameForConversation(row.conversation)}
                      </div>
                      <div className="message-row-category">{cat}</div>
                      <div className="message-row-date">
                        Delivers : {formatShortDate(row.message.scheduled_at || row.message.created_at)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-favorite-row"
                      onClick={(e) => handleToggleFavorite(e, row.message)}
                    >
                      {isFavoriteFlag(row.message) ? "♥" : "♡"}
                    </button>
                  </div>
                );
              })}

            {folder === FOLDER.FAVORITES &&
              filteredFavorites.map((m) => {
                const selected = String(selectedMessageId) === String(m.id);
                const cat = guessCategory("", m.content);
                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    className={`message-row ${selected ? "selected" : ""}`}
                    onClick={() => selectFavorite(m)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectFavorite(m);
                    }}
                  >
                    <div className="message-avatar">★</div>
                    <div className="message-row-meta">
                      <div className="message-row-name">Favorite</div>
                      <div className="message-row-category">{cat}</div>
                      <div className="message-row-date">
                        {formatShortDate(m.created_at || m.updated_at)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-favorite-row"
                      onClick={(e) => handleToggleFavorite(e, m)}
                    >
                      ♥
                    </button>
                  </div>
                );
              })}

            {!loading &&
              folder === FOLDER.INBOX &&
              filteredConversations.length === 0 && (
                <div className="message-detail-empty">No conversations yet.</div>
              )}
            {!loading && folder === FOLDER.SENT && filteredSent.length === 0 && (
              <div className="message-detail-empty">No sent messages yet.</div>
            )}
            {!loading && folder === FOLDER.FAVORITES && filteredFavorites.length === 0 && (
              <div className="message-detail-empty">No favorites yet.</div>
            )}
          </div>
        </section>

        <section className={`message-detail ${mobileView === "list" ? "mobile-hidden" : ""}`}>
          {mobileView === "detail" && (
            <button
              type="button"
              className="message-back-mobile"
              onClick={() => {
                setMobileView("list");
              }}
            >
              ← Back to list
            </button>
          )}

          {!selectedMessage ? (
            <div className="message-detail-empty">Select a message to preview</div>
          ) : (
            <>
              <h2 className="detail-title">
                {category} <em>For</em> &ldquo;{detailName}&rdquo;
              </h2>
              {untilDays !== null && scheduleIso ? (
                <p className="detail-sub">
                  Delivering In : <strong>{untilDays >= 0 ? `${untilDays} Days` : "Past"}</strong>
                </p>
              ) : null}

              <div className="detail-divider" />
              <p className="detail-label">Message Preview :</p>
              {editing ? (
                <textarea
                  className="edit-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              ) : (
                <p className="detail-preview">
                  &ldquo;{selectedMessage.content || "(No content)"}&rdquo;
                </p>
              )}

              <p className="detail-schedule">
                Schedule : <strong>{formatDateTime(scheduleIso)}</strong>
              </p>

              <div className="detail-divider" />
              <p className="detail-label">Timeline :</p>
              <ul className="timeline-list">
                <li>
                  Created : <strong>{formatShortDate(selectedMessage.created_at)}</strong>
                </li>
                <li>
                  Scheduled : <strong>{formatDateTime(scheduleIso)}</strong>
                </li>
                <li>
                  Delivery : <strong>Pending</strong>
                </li>
              </ul>

              <div className="detail-actions">
                {isOwnMessage || folder === FOLDER.SENT ? (
                  <>
                    {editing ? (
                      <button type="button" onClick={handleSaveEdit}>
                        Save
                      </button>
                    ) : (
                      <button type="button" onClick={() => setEditing(true)}>
                        Edit
                      </button>
                    )}
                    <button type="button" className="danger-outline" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyOpen(true);
                        setReplyBody("");
                      }}
                      disabled={!selectedConvId}
                    >
                      Reply
                    </button>
                    <button type="button" className="danger-outline" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {composeOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>New Message</h3>
            
            <label htmlFor="compose-body">Message</label>
            <textarea
              id="compose-body"
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Type Your Message Here....."
              rows={4}
            />

            <label htmlFor="compose-date">Choose The Date</label>
            <input
              id="compose-date"
              type="datetime-local"
              value={composeOpenDate}
              onChange={(e) => setComposeOpenDate(e.target.value)}
            />

            <label htmlFor="compose-mobile">Mobile Number</label>
            <input
              id="compose-mobile"
              type="tel"
              value={composeMobileNumber}
              onChange={(e) => setComposeMobileNumber(e.target.value)}
              placeholder="Mobile Number"
            />

            <label htmlFor="compose-recipients">Recipient Emails</label>
            <input
              id="compose-recipients"
              type="text"
              value={composeRecipients}
              onChange={(e) => setComposeRecipients(e.target.value)}
              placeholder="Emails separated by commas"
            />

            <div className="modal-checks">
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={composeIsHidden}
                  onChange={(e) => setComposeIsHidden(e.target.checked)}
                />
                <span>Keep Hidden Until Date</span>
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={composeHasReminder}
                  onChange={(e) => setComposeHasReminder(e.target.checked)}
                />
                <span>Get A Reminder</span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setComposeOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit"
                disabled={composeBusy}
                onClick={handleCompose}
              >
                {composeBusy ? "Saving..." : "Save Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {replyOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Reply</h3>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Your reply…"
            />
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setReplyOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit"
                disabled={replyBusy}
                onClick={handleReplySend}
              >
                {replyBusy ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
