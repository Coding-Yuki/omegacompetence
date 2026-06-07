# OMEGA COMPETENCE — IT Helpdesk System

A modern, responsive IT support ticket management system built with vanilla JavaScript, CSS3, and Firebase.

## 🚀 Features

### For Employees
- **Submit Support Tickets**: Easy-to-use form with real-time validation
- **Track Submissions**: View confirmation and ticket status
- **Account Management**: Sign up, sign in, password reset
- **Upgrade to Admin**: Self-service admin role upgrade with access code

### For Administrators
- **Live Dashboard**: Real-time ticket view with Firestore listeners
- **Ticket Management**: Update status, filter, and search tickets
- **Statistics**: Overview of total, open, high-priority, and resolved tickets
- **Detailed View**: Modal popup with full ticket information

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+ Modules)
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: Custom CSS with design tokens, no frameworks
- **Fonts**: Inter (Google Fonts)

## 📁 Project Structure

```
HelpDesk-IT/
├── index.html          # Employee ticket submission page
├── login.html          # Authentication page (sign-in, sign-up, password reset)
├── admin.html          # Admin dashboard for ticket management
├── firestore.rules     # Firebase security rules
├── CSS/
│   └── style.css       # Main stylesheet with design system
├── JS/
│   ├── firebase.js     # Firebase initialization and configuration
│   ├── auth.js         # Authentication logic (sign-in, sign-up, logout)
│   ├── submit.js       # Ticket form validation and submission
│   ├── admin.js        # Admin dashboard logic and real-time updates
│   ├── config.js       # App-wide constants and configuration
│   └── toast.js        # Toast notification system
└── README.md           # This file
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

The project uses a pre-configured Firebase project. If you need to use your own:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Update `JS/firebase.js` with your configuration

### 2. Firestore Security Rules

Deploy the security rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### 3. Admin Access Code

The default admin access code is: `OMEGA-IT-2025`

⚠️ **Important**: Change this in `JS/config.js` for production use.

### 4. Running Locally

Since this is a static site with ES modules, you need a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using VS Code
# Install "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8000` in your browser.

## 🎨 Design System

### Colors
- **Primary Brand**: `#ED1C24` (Bright Red)
- **Success**: `#16A34A` (Green)
- **Error**: `#DC2626` (Red)
- **Neutrals**: Gray scale from `#0F172A` to `#F8FAFC`

### Typography
- **Font Family**: Inter, Arial, system-ui, sans-serif
- **Base Size**: 16px (1rem)
- **Scale**: 0.75rem to 1.875rem

### Spacing
- **System**: 4px base unit (1sp = 4px)
- **Range**: 4px to 64px

## 🐛 Bug Fixes & Improvements (Recent)

### Critical Security Fix
- **Firestore Rules**: Fixed operator precedence bug that could allow unauthorized ticket updates
  - Changed: `(condition1 && condition2 || adminCondition)` 
  - To: `((condition1 && condition2) || adminCondition)`

### JavaScript Improvements
- **Auth State**: Improved error handling and logging in role-based redirects
- **Debounce**: Fixed debounce utility to use local timer instead of global
- **Toast System**: Added max toast limit (5) to prevent overflow and memory leaks
- **Documentation**: Added comprehensive JSDoc comments

### CSS Enhancements
- **Accessibility**: Added `prefers-reduced-motion` support
- **High Contrast**: Added `prefers-contrast: high` media query
- **Utility Classes**: Added `.visually-hidden`, `.text-center`, `.sr-only`, etc.
- **Print Styles**: Improved print stylesheet for better readability

## 🔒 Security Considerations

1. **Admin Code**: Currently client-side validated. For production, implement server-side validation via Cloud Functions.
2. **Firestore Rules**: Properly restrict read/write access based on user roles.
3. **Authentication**: Firebase Auth handles password security; ensure strong password requirements.
4. **XSS Prevention**: Use textContent instead of innerHTML where possible; sanitize user input.

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: > 680px
- **Tablet**: ≤ 680px
- **Mobile**: ≤ 400px

## ♿ Accessibility

- **Skip Links**: Keyboard navigation support
- **ARIA Labels**: Proper labeling for screen readers
- **Focus States**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects user preferences

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up as employee
- [ ] Sign in with employee account
- [ ] Submit a support ticket
- [ ] Sign up as admin (use code: OMEGA-IT-2025)
- [ ] View admin dashboard
- [ ] Update ticket status
- [ ] Filter and search tickets
- [ ] Logout and re-authenticate

### Automated Testing (Future)
- Unit tests for validation functions
- Integration tests for Firebase operations
- E2E tests with Cypress or Playwright

## 🚧 Known Limitations

1. **No Pagination**: All tickets load at once (fine for small datasets)
2. **No File Attachments**: Tickets are text-only
3. **No Email Notifications**: Status updates don't trigger emails
4. **Client-Side Admin Code**: Should be moved to server for production

## 📈 Future Enhancements

- [ ] Add ticket comments/replies
- [ ] Implement email notifications
- [ ] Add file attachment support
- [ ] Create ticket assignment system
- [ ] Add analytics dashboard
- [ ] Implement ticket categories/tags
- [ ] Add SLA tracking
- [ ] Mobile app (PWA)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for OMEGA COMPETENCE. All rights reserved.

## 📞 Support

For technical support or questions:
- **Email**: it-support@omegacompetence.com
- **Internal**: Contact the IT department

---

**Last Updated**: May 15, 2026  
**Version**: 1.0.0