import { request } from "./api";

async function listConversations(skip = 0, limit = 50) {
  const data = await request(`/conversations?skip=${skip}&limit=${limit}`);
  return Array.isArray(data) ? data : [];
}

async function getConversation(id) {
  return request(`/conversations/${id}`);
}

async function createConversation({ title, member_ids }) {
  return request("/conversations", {
    method: "POST",
    body: JSON.stringify({ title, member_ids }),
  });
}

async function deleteConversation(id) {
  return request(`/conversations/${id}`, { method: "DELETE" });
}

export { listConversations, getConversation, createConversation, deleteConversation };
