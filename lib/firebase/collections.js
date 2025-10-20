export const COLLECTIONS = {
  RESUMES: "resumes",
  CHATS: "resumeChats",
  CHAT_MESSAGES: "resumeChatMessages",
};

export const STORAGE_PATHS = {
  UPLOADS: "uploads",
  PDF_EXPORTS: "exports",
};

/**
 * Builds a Firestore document path for a user's resume.
 * @param {string} userId
 * @param {string} resumeId
 */
export function resumeDocPath(userId, resumeId) {
  return `${COLLECTIONS.RESUMES}/${userId}/items/${resumeId}`;
}

/**
 * Builds a Firestore collection path for chat sessions tied to a resume.
 * @param {string} userId
 * @param {string} resumeId
 */
export function resumeChatCollectionPath(userId, resumeId) {
  return `${resumeDocPath(userId, resumeId)}/${COLLECTIONS.CHATS}`;
}

/**
 * Builds a Storage path for user uploads.
 * @param {string} userId
 * @param {string} fileName
 */
export function uploadsPath(userId, fileName) {
  return `${STORAGE_PATHS.UPLOADS}/${userId}/${fileName}`;
}

/**
 * Builds a Storage path for generated PDFs.
 * @param {string} userId
 * @param {string} resumeId
 */
export function exportPdfPath(userId, resumeId) {
  return `${STORAGE_PATHS.PDF_EXPORTS}/${userId}/${resumeId}.pdf`;
}
