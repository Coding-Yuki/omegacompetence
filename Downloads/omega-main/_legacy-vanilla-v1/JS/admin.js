// ============================================================
//  admin.js  –  Live ticket dashboard logic (simplified)
//  Used by: admin.html
// ============================================================

import "./toast.js";
import { db, auth } from "./firebase.js";
import { CONFIG } from "./config.js";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ---------------------------------------------------------------
//  Auth guard – admin page is protected + role check
// ---------------------------------------------------------------
let listenerInitialized = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  try {
    const userSnap = await getDoc(doc(db, CONFIG.COLLECTIONS.USERS, user.uid));

    if (!userSnap.exists() || userSnap.data().role !== CONFIG.ROLES.ADMIN) {
      window.location.replace("index.html");
      return;
    }
  } catch (err) {
    console.error("Admin role check failed:", err);
    window.location.replace("index.html");
    return;
  }

  if (!listenerInitialized) {
    listenerInitialized = true;
    initTicketListener();
  }
});

// ---------------------------------------------------------------
//  Element refs
// ---------------------------------------------------------------
const loadingState = document.getElementById("state-loading");
const emptyState = document.getElementById("state-empty");
const ticketList = document.getElementById("ticket-list");
const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");

// ---------------------------------------------------------------
//  State
// ---------------------------------------------------------------
/** @type {Array<{id: string, data: object}>} */
let allTickets = [];

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------
function debounce(fn, delay = 300) {
  let localTimer = null;
  return (...args) => {
    clearTimeout(localTimer);
    localTimer = setTimeout(() => fn(...args), delay);
  };
}

function capitalize(str) {
  if (!str) return "";
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------
//  Render ticket list
// ---------------------------------------------------------------
function render() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const statusFilter = filterStatus.value;
  const priorityFilter = filterPriority.value;

  const filtered = allTickets.filter(({ data }) => {
    const matchesSearch =
      !searchTerm ||
      data.employeeName?.toLowerCase().includes(searchTerm) ||
      data.employeeEmail?.toLowerCase().includes(searchTerm) ||
      data.issueTitle?.toLowerCase().includes(searchTerm);

    const matchesStatus = !statusFilter || data.status === statusFilter;
    const matchesPriority = !priorityFilter || data.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Show/hide states
  loadingState.hidden = true;

  if (filtered.length === 0) {
    ticketList.hidden = true;
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  ticketList.hidden = false;

  // Build ticket items with header
  ticketList.innerHTML = `
    <div class="admin-ticket-list-header">
      <span>Ticket</span>
      <span>Priority</span>
      <span>Status</span>
      <span>Submitted By</span>
    </div>
  ` + filtered
    .map(({ id, data }) => {
      const priorityClass = `admin-priority--${data.priority || 'low'}`;
      const statusClass = `admin-status--${data.status || 'open'}`;
      const statusLabel = {
        'open': 'Open',
        'in-progress': 'In Progress',
        'resolved': 'Resolved',
        'closed': 'Closed'
      }[data.status] || 'Open';

      return `
        <div class="admin-ticket-item" tabindex="0" role="button" aria-label="View details for ${data.issueTitle}">
          <div class="ticket-cell-title">
            <div class="admin-ticket-title">${data.issueTitle || 'Untitled'}</div>
            <div class="admin-ticket-submitter">${data.submittedBy || 'Unknown'}</div>
          </div>
          <div class="ticket-cell-priority">
            <span class="admin-priority ${priorityClass}">${capitalize(data.priority) || 'Low'}</span>
          </div>
          <div class="ticket-cell-status">
            <select class="admin-status-select" data-id="${id}" aria-label="Update status">
              <option value="open" ${data.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="in-progress" ${data.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="resolved" ${data.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="closed" ${data.status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
          <div class="ticket-cell-submitter">
            <span>${data.employeeName || data.submittedBy || 'Unknown'}</span>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach click listeners to open modal
  ticketList.querySelectorAll(".admin-ticket-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.closest("select")) return;
      const ticket = allTickets.find(t => t.id === item.querySelector(".admin-status-select").dataset.id);
      if (ticket) showTicketModal(ticket.data);
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const ticket = allTickets.find(t => t.id === item.querySelector(".admin-status-select").dataset.id);
        if (ticket) showTicketModal(ticket.data);
      }
    });
  });

  // Attach change listeners to status selects
  ticketList.querySelectorAll(".admin-status-select").forEach((sel) => {
    sel.addEventListener("change", handleStatusChange);
  });
}

// ---------------------------------------------------------------
//  Ticket Detail Modal
// ---------------------------------------------------------------
function formatFullDate(ts) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showTicketModal(ticket) {
  const existing = document.getElementById("ticket-modal");
  if (existing) existing.remove();

  const statusLabels = {
    'open': 'Open',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed'
  };

  const modal = document.createElement("div");
  modal.id = "ticket-modal";
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
    padding: 20px; animation: fadeIn 0.2s ease;
  `;

  const statusClass = `admin-status--${ticket.status || 'open'}`;
  const priorityClass = `admin-priority--${ticket.priority || 'low'}`;

  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.2);animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e5e7eb">
        <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0">${ticket.issueTitle || 'Ticket Details'}</h2>
        <button class="modal-close" style="background:none;border:none;padding:8px;cursor:pointer;color:#64748B;border-radius:6px">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div style="padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9">
          <span style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.04em">Status</span>
          <span class="admin-status ${statusClass}" style="font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px">${statusLabels[ticket.status] || 'Open'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9">
          <span style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.04em">Priority</span>
          <span class="admin-priority ${priorityClass}" style="font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px">${capitalize(ticket.priority) || 'Low'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9">
          <span style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.04em">Submitted By</span>
          <span style="font-size:14px;color:#334155">${ticket.employeeName || '—'} (${ticket.employeeEmail || ticket.submittedBy || '—'})</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9">
          <span style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.04em">Date</span>
          <span style="font-size:14px;color:#334155">${formatFullDate(ticket.submittedAt)}</span>
        </div>
        <div style="margin-top:16px">
          <span style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.04em">Description</span>
          <div style="margin-top:8px;font-size:14px;color:#475569;line-height:1.7;white-space:pre-wrap;background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0">${ticket.description || 'No description provided.'}</div>
        </div>
      </div>
    </div>
  `;

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);

  modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  document.body.appendChild(modal);

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

// ---------------------------------------------------------------
//  Update ticket status
// ---------------------------------------------------------------
async function handleStatusChange(e) {
  const select = e.target;
  const ticketId = select.dataset.id;
  const newStatus = select.value;
  const previousStatus = select.closest(".admin-ticket-item").querySelector(".admin-status-select").value;

  select.disabled = true;

  try {
    await updateDoc(doc(db, CONFIG.COLLECTIONS.TICKETS, ticketId), { status: newStatus });
    window.toast?.success(`Status updated to ${capitalize(newStatus)}`);
  } catch (err) {
    console.error("Failed to update ticket status:", err);
    select.value = previousStatus;
    window.toast?.error("Failed to update status. Please try again.");
  } finally {
    select.disabled = false;
  }
}

// ---------------------------------------------------------------
//  Real-time Firestore listener
// ---------------------------------------------------------------
function initTicketListener() {
  const ticketsQuery = query(
    collection(db, CONFIG.COLLECTIONS.TICKETS),
    orderBy("submittedAt", "desc")
  );

  onSnapshot(
    ticketsQuery,
    (snapshot) => {
      allTickets = snapshot.docs.map((d) => ({ id: d.id, data: d.data() }));
      render();
    },
    (err) => {
      console.error("Firestore listener error:", err);
      loadingState.hidden = true;
      emptyState.hidden = false;
      emptyState.querySelector('p').textContent = "Failed to load tickets. Check your connection.";
    }
  );
}

// ---------------------------------------------------------------
//  Filter / search listeners
// ---------------------------------------------------------------
searchInput.addEventListener("input", debounce(render, 300));
filterStatus.addEventListener("change", render);
filterPriority.addEventListener("change", render);