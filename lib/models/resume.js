/**
 * @typedef {Object} ResumeExperienceItem
 * @property {string} id
 * @property {string} role
 * @property {string} company
 * @property {string} startDate
 * @property {string} endDate
 * @property {string[]} bullets
 */

/**
 * @typedef {Object} ResumeEducationItem
 * @property {string} id
 * @property {string} institution
 * @property {string} degree
 * @property {string} startYear
 * @property {string} endYear
 * @property {string[]} details
 */

/**
 * @typedef {Object} ResumeProjectItem
 * @property {string} id
 * @property {string} name
 * @property {string} link
 * @property {string[]} highlights
 */

/**
 * @typedef {Object} ResumeBasics
 * @property {string} fullName
 * @property {string} headline
 * @property {string} location
 * @property {string} email
 * @property {string} phone
 * @property {string} summary
 */

/**
 * @typedef {Object} ResumeDocument
 * @property {string} id
 * @property {ResumeBasics} basics
 * @property {ResumeExperienceItem[]} experience
 * @property {ResumeEducationItem[]} education
 * @property {string[]} skills
 * @property {ResumeProjectItem[]} projects
 * @property {string} ownerId
 * @property {string} title
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} fileURL
 * @property {string} fileName
 * @property {string} fileType
 * @property {number} fileSize
 * @property {string} filePath
 * @property {string} parsedText
 * @property {string|null} uploadedAt
 */

/**
 * Returns an empty resume document skeleton for new users.
 * @param {Partial<ResumeDocument>} [overrides]
 * @returns {ResumeDocument}
 */
export function createEmptyResume(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: "",
    title: "Untitled",
    ownerId: "",
    status: "draft",
    fileURL: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
    filePath: "",
    parsedText: "",
    uploadedAt: null,
    basics: {
      fullName: "",
      headline: "",
      location: "",
      email: "",
      phone: "",
      summary: "",
      ...(overrides.basics || {}),
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
