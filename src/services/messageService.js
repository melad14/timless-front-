import { request } from "./api";

async function getMessagesForConversation(conversationId, skip = 0, limit = 50) {
  return request(
    `/messages/conversation/${conversationId}?skip=${skip}&limit=${limit}`
  );
}

async function getFavoriteMessages(skip = 0, limit = 50) {
  const data = await request(`/messages/user/favorites?skip=${skip}&limit=${limit}`);
  return Array.isArray(data) ? data : [];
}

async function getMessage(id) {
  return request(`/messages/${id}`);
}

async function sendMessage({ conversation_id, content, content_type = "text", scheduled_at = null }) {
  return request("/messages", {
    method: "POST",
    body: JSON.stringify({ conversation_id, content, content_type, scheduled_at }),
  });
}

async function updateMessage(id, content) {
  return request(`/messages/${id}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

async function deleteMessage(id) {
  return request(`/messages/${id}`, { method: "DELETE" });
}

async function toggleMessageFavorite(id) {
  return request(`/messages/${id}/favorite`, { method: "POST" });
}

async function markMessageRead(id) {
  return request(`/messages/${id}/read`, { method: "POST" });
}

async function getSentMessages(skip = 0, limit = 50) {
  const data = await request(`/messages/user/sent?skip=${skip}&limit=${limit}`);
  return Array.isArray(data) ? data : [];
}

export {
  getMessagesForConversation,
  getFavoriteMessages,
  getSentMessages,
  getMessage,
  sendMessage,
  updateMessage,
  deleteMessage,
  toggleMessageFavorite,
  markMessageRead,
};
