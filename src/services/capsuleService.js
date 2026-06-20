import { request } from "./api";

function buildCapsuleTitle(content) {
  const clean = content.trim();
  if (!clean) return "New Message";
  return clean.length > 32 ? `${clean.slice(0, 32)}...` : clean;
}

async function createCapsule({ content, openDate, recipients, recipients_phones }) {
  return request("/time-capsules", {
    method: "POST",
    body: JSON.stringify({
      title: buildCapsuleTitle(content),
      content,
      content_type: "text",
      open_date: openDate,
      recipients: recipients || [],
      recipients_phones: recipients_phones || [],
    }),
  });
}

async function getSharedCapsule(id) {
  return request(`/shared-capsules/${id}`, {
    method: "GET",
  });
}

export { createCapsule, getSharedCapsule };
