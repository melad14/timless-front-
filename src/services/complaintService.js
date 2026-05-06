import { request } from "./api";

/**
 * Create a complaint/suggestion as a conversation message
 * @param {Object} payload - { issueType, description, allowContact, attachmentUrl, type: 'complaint' | 'suggestion', rating }
 * @returns {Promise<Object>} - Created message/conversation
 */
async function submitComplaint(payload) {
  const {
    issueType = "general",
    description,
    allowContact = false,
    attachmentUrl = null,
    type = "complaint", // 'complaint' or 'suggestion'
    rating = 0,
  } = payload;

  if (!description?.trim()) {
    throw new Error("Description is required");
  }

  // Create a special conversation for tracking complaints/suggestions
  const conversationTitle = `${type === "suggestion" ? "💡 Suggestion" : "⚠️ Complaint"}: ${issueType}`;

  try {
    // First, create or get conversation
    const conversationRes = await request("/conversations", {
      method: "POST",
      body: JSON.stringify({
        title: conversationTitle,
        member_ids: [], // System conversation
      }),
    });

    const conversationId = conversationRes.id;

    // Then send message with details
    const messagePayload = {
      conversation_id: conversationId,
      content: description,
      content_type: "text",
      // Extended fields (if backend supports)
      metadata: {
        type,
        issueType,
        allowContact,
        rating,
        attachmentUrl,
        submittedAt: new Date().toISOString(),
      },
    };

    const messageRes = await request("/messages", {
      method: "POST",
      body: JSON.stringify(messagePayload),
    });

    return {
      success: true,
      conversationId,
      messageId: messageRes.id,
      message: messageRes,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to submit complaint/suggestion");
  }
}

/**
 * Upload file for complaint/suggestion
 * @param {File} file - File to upload
 * @returns {Promise<Object>} - File metadata
 */
async function uploadAttachment(file) {
  if (!file) throw new Error("File is required");

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit");
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "video/mp4"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed: JPG, PNG, PDF, MP4");
  }

  // Return file metadata
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
}

export { submitComplaint, uploadAttachment };
