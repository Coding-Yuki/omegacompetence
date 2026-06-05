// ============================================================
//  auth.js  –  Firebase Authentication logic
//  Used by: index.html (logout guard & sign-in)
// ============================================================

import "./toast.js";
import { auth, db } from "./firebase.js";
import { CONFIG } from "./config.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------
const PAGE = window.location.pathname.split("/").pop(); // e.g. "index.html"

/**
 * Show an inline error message inside a given element.
 * @param {HTMLElement} el   - The element to put the message in.
 * @param {string}      msg  - The message to display.
 */
function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.removeAttribute("hidden");
}

/**
 * Clear an inline error element.
 * @param {HTMLElement} el
 */
function clearError(el) {
    if (!el) return;
    el.textContent = "";
    el.setAttribute("hidden", "");
}

// ---------------------------------------------------------------
//  Route based on user role
// ---------------------------------------------------------------
async function redirectBasedOnRole(user) {
    try {
        const userSnap = await getDoc(doc(db, CONFIG.COLLECTIONS.USERS, user.uid));
        if (userSnap.exists() && userSnap.data().role === CONFIG.ROLES.ADMIN) {
            window.location.replace("admin.html");
            return;
        }
        if (!userSnap.exists()) {
            // Create user doc with employee role by default
            await setDoc(doc(db, CONFIG.COLLECTIONS.USERS, user.uid), {
                role: CONFIG.ROLES.EMPLOYEE,
                email: user.email,
                createdAt: new Date().toISOString()
            });
            console.log("Created missing user doc on sign-in for:", user.email);
        }
    } catch (err) {
        console.error("Error checking user role:", err);
        // Fall through to index.html on error
    }
    window.location.replace("index.html");
}

// ---------------------------------------------------------------
//  Auth State Guard
//  • If on index.html and NOT logged in → show auth form
//  • If on index.html and ALREADY logged in → show portal based on role
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    // On index.html - if already logged in, redirect based on role
    // If not logged in, stay on index.html (shows auth form)
    if (PAGE === "index.html" || PAGE === "") {
        if (user) {
            redirectBasedOnRole(user);
        }
    }
});

// ---------------------------------------------------------------
//  LOGOUT  (index.html)
// ---------------------------------------------------------------
const logoutBtn = document.getElementById("logout-btn");

const logoutIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = `${logoutIcon} Signing out…`;

        try {
            await signOut(auth);
            window.toast?.success("You have been signed out");
        } catch (err) {
            console.error("Sign-out error:", err);
            logoutBtn.disabled = false;
            logoutBtn.innerHTML = `${logoutIcon} Logout`;
            window.toast?.error("Failed to sign out. Please try again.");
        }
    });
}

// ---------------------------------------------------------------
//  SIGN-IN & SIGN-UP FORMS  (login.html)
// ---------------------------------------------------------------
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginTitle = document.querySelector(".login-title");
const showSignupBtn = document.getElementById("show-signup");
const showLoginBtn = document.getElementById("show-login");
const showForgotPasswordBtn = document.getElementById("show-forgot-password");

const emailInput = document.getElementById("login-email");
const passInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

const signupEmailInput = document.getElementById("signup-email");
const signupPassInput = document.getElementById("signup-password");
const signupAdminCodeInput = document.getElementById("signup-admin-code");
const signupBtn = document.getElementById("signup-btn");

const loginError = document.getElementById("login-error");
const loginErrorText = document.getElementById("login-error-text");

if (loginForm && showSignupBtn) {
    showSignupBtn.onclick = function(e) {
        e.preventDefault();
        loginForm.hidden = true;
        signupForm.hidden = false;
        const fp = document.getElementById("forgot-password-form");
        if (fp) fp.hidden = true;
        loginTitle.textContent = "Create an Account";
        clearError(loginError);
        signupEmailInput?.focus();
    };

    if (showForgotPasswordBtn) {
        showForgotPasswordBtn.onclick = function(e) {
            e.preventDefault();
            loginForm.hidden = true;
            const fp = document.getElementById("forgot-password-form");
            if (fp) fp.hidden = false;
            loginTitle.textContent = "Reset Password";
            clearError(loginError);
        };
    }
}

if (showLoginBtn && signupForm) {
    showLoginBtn.onclick = function(e) {
        e.preventDefault();
        signupForm.hidden = true;
        const fp = document.getElementById("forgot-password-form");
        if (fp) fp.hidden = true;
        loginForm.hidden = false;
        loginTitle.textContent = "Staff Portal Sign In";
        clearError(loginError);
        emailInput?.focus();
    };
}

// Only set up form handlers on login page
if (loginForm && signupForm) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches('#login-email, #login-password')) {
            loginForm.dispatchEvent(new Event('submit', { bubbles: true }));
        }
        if (e.key === 'Enter' && e.target.matches('#signup-email, #signup-password')) {
            signupForm.dispatchEvent(new Event('submit', { bubbles: true }));
        }
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError(loginError);

        const email = emailInput?.value.trim();
        const password = passInput?.value;

        if (!email || !password) {
            if (loginErrorText) loginErrorText.textContent = "Please enter your email and password.";
            showError(loginError, "");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing in…";

        try {
            console.log("Attempting login with:", email);
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful!");
        } catch (err) {
            console.error("LOGIN ERROR:", err.code, "-", err.message);

            let friendlyMsg;
            if (err.code === "auth/invalid-credential") {
                friendlyMsg = "Email or password is incorrect. If you just created an account, try the password you just set.";
            } else if (err.code === "auth/user-not-found") {
                friendlyMsg = "No account found with that email. Please create an account first.";
            } else if (err.code === "auth/wrong-password") {
                friendlyMsg = "Incorrect password. Please try again.";
            } else if (err.code === "auth/too-many-requests") {
                friendlyMsg = "Too many failed attempts. Please wait 1 minute and try again.";
            } else if (err.code === "auth/user-disabled") {
                friendlyMsg = "This account has been disabled. Contact IT support.";
            } else {
                friendlyMsg = `Sign-in failed: ${err.message}`;
            }

            showError(loginError, friendlyMsg);
            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError(loginError);

        const email = signupEmailInput?.value.trim();
        const password = signupPassInput?.value;

        if (!email || !password) {
            if (loginErrorText) loginErrorText.textContent = "Please enter your email and password.";
            showError(loginError, "");
            return;
        }

        if (password.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
            if (loginErrorText) loginErrorText.textContent = `Password must be at least ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} characters.`;
            showError(loginError, "");
            return;
        }

        signupBtn.disabled = true;
        signupBtn.textContent = "Creating Account…";

        const adminCode = signupAdminCodeInput?.value.trim() || "";
        const isAdmin = adminCode === CONFIG.ADMIN_SECRET_CODE;
        const role = isAdmin ? CONFIG.ROLES.ADMIN : CONFIG.ROLES.EMPLOYEE;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Signup success, user:", user.uid, user.email);

            await setDoc(doc(db, CONFIG.COLLECTIONS.USERS, user.uid), {
                role: role,
                email: email,
                createdAt: new Date().toISOString(),
                ...(isAdmin && { _upgradeToken: adminCode })
            });
            console.log("User doc created in Firestore with role:", role);

            if (isAdmin) {
                window.toast?.success("Admin account created! Redirecting to dashboard...");
                // Manual redirect for admin users to avoid race condition
                setTimeout(() => {
                    window.location.replace("admin.html");
                }, 1500);
            } else {
                window.toast?.success("Account created successfully! Redirecting...");
            }
        } catch (err) {
            console.error("Signup error:", err.code, err.message);
            const friendlyMsg = {
                "auth/email-already-in-use": "An account already exists with that email address.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/weak-password": "Password should be at least 6 characters."
            }[err.code] ?? "Failed to create account. Please check your credentials and try again.";

            if (loginErrorText) loginErrorText.textContent = friendlyMsg;
            showError(loginError, "");

            signupBtn.disabled = false;
            signupBtn.textContent = "Create Account";
        }
    });
}

// ---------------------------------------------------------------
//  FORGOT PASSWORD  (login.html)
// ---------------------------------------------------------------
const forgotPasswordForm = document.getElementById("forgot-password-form");
const forgotPasswordEmail = document.getElementById("forgot-password-email");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const backToLoginBtn = document.getElementById("back-to-login");

if (forgotPasswordForm) {
    // Note: showSignupBtn and showLoginBtn handlers are in the main section above
    
    showLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        forgotPasswordForm.setAttribute("hidden", "");
        loginForm.removeAttribute("hidden");
        loginTitle.textContent = "Staff Portal Sign In";
    });

    backToLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        forgotPasswordForm.setAttribute("hidden", "");
        loginForm.removeAttribute("hidden");
        loginTitle.textContent = "Staff Portal Sign In";
    });

    forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError(loginError);

        const email = forgotPasswordEmail?.value.trim();

        if (!email) {
            if (loginErrorText) loginErrorText.textContent = "Please enter your email address.";
            showError(loginError, "");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (loginErrorText) loginErrorText.textContent = "Please enter a valid email address.";
            showError(loginError, "");
            return;
        }

        forgotPasswordBtn.disabled = true;
        forgotPasswordBtn.textContent = "Sending...";

        try {
            await sendPasswordResetEmail(auth, email);
            window.toast?.success("Password reset email sent! Check your inbox.");

            setTimeout(() => {
                forgotPasswordForm.setAttribute("hidden", "");
                loginForm.removeAttribute("hidden");
                loginTitle.textContent = "Staff Portal Sign In";
                emailInput.value = email;
                passInput?.focus();
            }, 2000);
        } catch (err) {
            const friendlyMsg = {
                "auth/user-not-found": "No account found with that email address.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/too-many-requests": "Too many requests. Please wait a moment and try again."
            }[err.code] ?? "Failed to send reset email. Please try again.";

            if (loginErrorText) loginErrorText.textContent = friendlyMsg;
            showError(loginError, "");
        } finally {
            forgotPasswordBtn.disabled = false;
            forgotPasswordBtn.textContent = "Send Reset Link";
        }
    });
}
