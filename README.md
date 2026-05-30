# Support Ticketing System

A full-stack customer support portal with real-time messaging, role-based access control, and JWT authentication.

🔗 [Live Demo](https://enterprise-support-portal.vercel.app/)

## Features
- Role-Based Access Control (Admin, Staff, Customer) with query-level data isolation
- JWT authentication with protected routes and rate limiting
- Real-time bi-directional ticket messaging via Socket.io
- Searchable, filterable ticket dashboard
- Staff assignment and admin-controlled role promotion

## Tech Stack
**Frontend:** React.js, Context API, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL  
**Real-time:** Socket.io  
**Auth:** JWT  
**Deployment:** Vercel, Render  

## Database Schema
```
users       — id, name, email, password, role
tickets     — id, title, description, status, priority, customer_id, staff_id
replies     — id, ticket_id, user_id, message, created_at
```

## API Routes
```
POST   /api/users              — register
POST   /api/users/login        — login
GET    /api/users/me           — get profile
GET    /api/users              — get all users (admin)
PUT    /api/users/:id/role     — update user role (admin)
GET    /api/users/staff        — get staff list

GET    /api/tickets            — get tickets
POST   /api/tickets            — create ticket
GET    /api/tickets/dashboard/stats  — dashboard stats
PUT    /api/tickets/:id        — update ticket status
POST   /api/tickets/:id/replies     — add reply
GET    /api/tickets/:id/replies     — get replies
PUT    /api/tickets/:id/assign      — assign staff
```

## Challenges

**Auth state flash on page refresh**  
On hard refresh, `user` state resets to `null` before the `/users/me` fetch completes — causing `ProtectedRoute` to redirect logged-in users to login despite a valid JWT in `localStorage`. Fixed by adding a `loading` state in `AuthContext` that blocks routing until the auth check finishes.

**Duplicate Socket.io listeners on re-render**  
Every time a message arrived, React re-rendered the component and registered a new `socket.on('receive_reply')` listener — without removing the old one. Messages started appearing multiple times as listeners stacked up. Fixed by returning `socket.off('receive_reply')` as a cleanup inside `useEffect`, ensuring only one listener exists at a time.


## Setup & Installation

### Backend
```bash
cd server
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create `.env` in `/server`:
```
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

## Test Credentials
- **Admin:** admin1234@gmail.com / admin1234
- **Customer:** register normally