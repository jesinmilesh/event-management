# 📅 Project 3 — Event Management & Registration System

A full-stack Event Management system with real-time capacity meters, seat availability enforcement, duplicate registration prevention, and admin event scheduling.

## 📁 Folder Structure
```text
3-event-management/
├── backend/
│   ├── config/db.js
│   ├── models/Event.js
│   ├── models/EventRegistration.js
│   ├── models/User.js
│   ├── controllers/eventController.js
│   ├── controllers/authController.js
│   ├── routes/eventRoutes.js
│   ├── routes/authRoutes.js
│   ├── middleware/auth.js
│   ├── seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```

## 🚀 How to Run
1. Start the backend:
   ```bash
   cd 3-event-management/backend
   node seed.js    # Seed demo events & accounts
   node server.js  # Starts server on http://localhost:5002
   ```
2. Open **`http://localhost:5002`** in your browser!

## 🔑 Demo Accounts
- **Admin / Organizer**: `admin@example.com` / `Password@123` (Can create and manage events)
- **User / Participant**: `user@example.com` / `Password@123` (Can register for events)
