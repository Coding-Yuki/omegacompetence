// ============================================================
//  submit.js  –  Ticket form validation & Firestore submission
//  Used by: index.html
// ============================================================

import "./toast.js";
import { db }        from "./firebase.js";
import { CONFIG }    from "./config.js";
import { auth }      from "./firebase.js";
import { collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ---------------------------------------------------------------
//  Element refs
// ---------------------------------------------------------------
const form            = document.getElementById("ticket-form");
const submitBtn       = document.getElementById("submit-btn");
const successPanel    = document.getElementById("success-message");
const submitAnotherBtn = document.getElementById("submit-another-btn");

// Field refs
const fields = {
  "emp-name":    document.getElementById("emp-name"),
  "emp-email":   document.getElementById("emp-email"),
  "issue-title": document.getElementById("issue-title"),
  "priority":    document.getElementById("priority"),
  "issue-desc":  document.getElementById("issue-desc"),
};

// Error span refs (id pattern: <field-id>-error)
const errors = Object.fromEntries(
  Object.keys(fields).map((k) => [k, document.getElementById(`${k}-error`)])
);

// ---------------------------------------------------------------
//  Validation rules
// ---------------------------------------------------------------
const validators = {
  "emp-name": (v) => {
    if (!v) return "Full name is required.";
    if (v.length < CONFIG.VALIDATION.NAME_MIN_LENGTH) return `Name must be at least ${CONFIG.VALIDATION.NAME_MIN_LENGTH} characters.`;
    return null;
  },
  "emp-email": (v) => {
    if (!v) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
    return null;
  },
  "issue-title": (v) => {
    if (!v) return "Issue title is required.";
    if (v.length < CONFIG.VALIDATION.TITLE_MIN_LENGTH) return `Title must be at least ${CONFIG.VALIDATION.TITLE_MIN_LENGTH} characters.`;
    return null;
  },
  "priority": (v) => {
    if (!v) return "Please select a priority level.";
    return null;
  },
  "issue-desc": (v) => {
    if (!v) return "Description is required.";
    if (v.length < CONFIG.VALIDATION.DESCRIPTION_MIN_LENGTH) return `Please provide at least ${CONFIG.VALIDATION.DESCRIPTION_MIN_LENGTH} characters of detail.`;
    return null;
  },
};

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------
function getValue(key) {
  return fields[key]?.value.trim() ?? "";
}

function setFieldState(key, errorMsg) {
  const input = fields[key];
  const errEl = errors[key];
  if (!input || !errEl) return;

  if (errorMsg) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    errEl.textContent = errorMsg;
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    errEl.textContent = "";
  }
}

function validateAll() {
  let valid = true;
  for (const key of Object.keys(validators)) {
    const msg = validators[key](getValue(key));
    setFieldState(key, msg);
    if (msg) valid = false;
  }
  return valid;
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Submitting…" : "Submit Ticket";
}

// ---------------------------------------------------------------
//  Auto-fill employee email from logged-in user
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (user && user.email) {
    const emailField = fields["emp-email"];
    if (emailField && !emailField.value) {
      emailField.value = user.email;
      emailField.classList.add("is-valid");
    }
    const nameField = fields["emp-name"];
    if (nameField && !nameField.value && user.displayName) {
      nameField.value = user.displayName;
      nameField.classList.add("is-valid");
    }
  }
});

// ---------------------------------------------------------------
//  Real-time inline validation (on blur)
// ---------------------------------------------------------------
for (const key of Object.keys(fields)) {
  fields[key]?.addEventListener("blur", () => {
    const msg = validators[key]?.(getValue(key));
    setFieldState(key, msg ?? null);
  });

  // Clear error as user types
  fields[key]?.addEventListener("input", () => {
    if (fields[key].classList.contains("is-invalid")) {
      const msg = validators[key]?.(getValue(key));
      if (!msg) setFieldState(key, null);
    }
  });
}

// ---------------------------------------------------------------
//  Form submit
// ---------------------------------------------------------------
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateAll()) return;

  // Grab current user (should always be present due to auth guard in auth.js)
  const currentUser = auth.currentUser;

  setLoading(true);

  try {
    await addDoc(collection(db, CONFIG.COLLECTIONS.TICKETS), {
      employeeName:  getValue("emp-name"),
      employeeEmail: getValue("emp-email"),
      issueTitle:    getValue("issue-title"),
      priority:      getValue("priority"),
      description:   getValue("issue-desc"),
      status:        "open",
      submittedBy:   currentUser?.email ?? "anonymous",
      submittedAt:   serverTimestamp(),
    });

    // Reset button before hiding form
    setLoading(false);

    // Show success panel, hide form
    form.setAttribute("hidden", "");
    successPanel?.removeAttribute("hidden");

  } catch (err) {
    console.error("Firestore submission error:", err);
    window.toast?.error("Failed to submit ticket. Please check your connection and try again.");
    setLoading(false);
  }
});

// ---------------------------------------------------------------
//  "Submit Another Ticket" — reset everything
// ---------------------------------------------------------------
submitAnotherBtn?.addEventListener("click", () => {
  form?.reset();

  // Always reset the button to its original state
  setLoading(false);

  // Clear all validation states
  for (const key of Object.keys(fields)) {
    fields[key]?.classList.remove("is-valid", "is-invalid");
    if (errors[key]) errors[key].textContent = "";
  }

  successPanel?.setAttribute("hidden", "");
  form?.removeAttribute("hidden");

  // Focus on first field for better UX
  fields["emp-name"]?.focus();

  // Scroll back to form top
  form?.scrollIntoView({ behavior: "smooth" });
});

// ---------------------------------------------------------------
//  Auth guard – redirect if not logged in (belt-and-suspenders)
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.replace("index.html");
});
