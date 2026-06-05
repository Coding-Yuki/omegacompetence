// ============================================================
//  toast.js  –  Toast notification system
//  Usage: toast.show(message, type)
//  Types: 'success' (default), 'error', 'warning', 'info'
// ============================================================

/**
 * Toast notification system with auto-dismiss and manual close.
 * Prevents memory leaks by properly cleaning up toasts.
 */

// Maximum number of toasts to display at once
const MAX_TOASTS = 5;

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.setAttribute('aria-live', 'polite');
toastContainer.setAttribute('aria-atomic', 'true');
document.body.appendChild(toastContainer);

const toastStyles = `
  #toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    min-width: 280px;
    max-width: 400px;
    pointer-events: auto;
    animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-left: 4px solid;
  }

  .toast.removing {
    animation: slideOutRight 0.25s ease forwards;
  }

  .toast--success { border-left-color: #16A34A; }
  .toast--success .toast-icon { color: #16A34A; }

  .toast--error { border-left-color: #DC2626; }
  .toast--error .toast-icon { color: #DC2626; }

  .toast--warning { border-left-color: #F59E0B; }
  .toast--warning .toast-icon { color: #F59E0B; }

  .toast--info { border-left-color: #3B82F6; }
  .toast--info .toast-icon { color: #3B82F6; }

  .toast-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .toast-message {
    flex: 1;
    line-height: 1.4;
  }

  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #94A3B8;
    transition: color 0.15s ease;
    border-radius: 4px;
  }

  .toast-close:hover {
    color: #64748B;
    background: #F1F5F9;
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }

  @media (max-width: 480px) {
    #toast-container {
      top: 16px;
      right: 16px;
      left: 16px;
    }
    .toast {
      min-width: auto;
      max-width: none;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);

const icons = {
  success: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
  error: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
  warning: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  info: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
};

/**
 * Remove oldest toast when max limit is reached
 */
function enforceMaxToasts() {
  const toasts = toastContainer.querySelectorAll('.toast');
  while (toasts.length >= MAX_TOASTS) {
    const oldest = toasts[0];
    oldest.classList.add('removing');
    setTimeout(() => oldest.remove(), 250);
    break;
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Time in ms before auto-dismiss (0 = no auto-dismiss)
 * @returns {{ close: Function }} Object with close method
 */
function show(message, type = 'success', duration = 4000) {
  // Enforce max toasts limit to prevent overflow
  enforceMaxToasts();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  
  /** Remove this toast with animation */
  const remove = () => {
    if (!toast.parentNode) return; // Already removed
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 250);
  };

  closeBtn.addEventListener('click', remove);

  toastContainer.appendChild(toast);

  if (duration > 0) {
    setTimeout(remove, duration);
  }

  return { close: remove };
}

window.toast = {
  success: (msg, dur) => show(msg, 'success', dur),
  error: (msg, dur) => show(msg, 'error', dur),
  warning: (msg, dur) => show(msg, 'warning', dur),
  info: (msg, dur) => show(msg, 'info', dur),
  show
};