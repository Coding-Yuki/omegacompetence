// ============================================================
//  config.js  –  App-wide constants and configuration
//  Central configuration for the IT Helpdesk application.
//  All magic strings and numbers should be defined here.
// ============================================================

/**
 * @typedef {Object} Config
 * @property {Object} COLLECTIONS - Firestore collection names
 * @property {Object} STATUS - Ticket status values
 * @property {Object} PRIORITY - Ticket priority values
 * @property {Object} ROLES - User role values
 * @property {Object} UI - UI-related configuration
 * @property {string} ADMIN_SECRET_CODE - Code for admin registration/upgrade
 * @property {Object} VALIDATION - Form validation rules
 * @property {Object} DATE_FORMAT - Date formatting options
 */

export const CONFIG = {
  // Firestore collections
  COLLECTIONS: {
    TICKETS: 'tickets',
    USERS: 'users'
  },

  // Ticket statuses
  STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },

  // Ticket priorities
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // User roles
  ROLES: {
    EMPLOYEE: 'employee',
    ADMIN: 'admin'
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 4000,
    SEARCH_DEBOUNCE: 300,
    ANIMATION_DURATION: 300
  },

  // Secret code that allows a user to register as admin
  ADMIN_SECRET_CODE: "OMEGA-COMPETENCE-2026",

  // Validation rules
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    TITLE_MIN_LENGTH: 5,
    DESCRIPTION_MIN_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 6
  },

  // Date format options
  DATE_FORMAT: {
    SHORT: { day: '2-digit', month: 'short', year: 'numeric' },
    LONG: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  }
};

// Status display mapping
export const STATUS_LABELS = {
  [CONFIG.STATUS.OPEN]: 'Open',
  [CONFIG.STATUS.IN_PROGRESS]: 'In Progress',
  [CONFIG.STATUS.RESOLVED]: 'Resolved',
  [CONFIG.STATUS.CLOSED]: 'Closed'
};

// Priority display mapping
export const PRIORITY_LABELS = {
  [CONFIG.PRIORITY.LOW]: 'Low',
  [CONFIG.PRIORITY.MEDIUM]: 'Medium',
  [CONFIG.PRIORITY.HIGH]: 'High'
};

// Export status array for dropdowns
export const STATUS_OPTIONS = Object.values(CONFIG.STATUS);
export const PRIORITY_OPTIONS = Object.values(CONFIG.PRIORITY);

// Helper to check if user is admin
export async function isAdmin(user, userDoc) {
  return userDoc?.exists && userDoc.data().role === CONFIG.ROLES.ADMIN;
}

// Helper to check if user owns the ticket
export function isTicketOwner(ticketData, userEmail) {
  return ticketData.submittedBy === userEmail;
}