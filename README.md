# Support Ticketing System

A full-stack customer support portal with real-time messaging, role-based access control, and JWT authentication.

🔗 [Live Demo](https://enterprise-support-portal.vercel.app/)

## Features
- Role-Based Access Control (Admin, Staff, Customer)
- JWT authentication with protected routes
- Real-time ticket messaging via Socket.io
- Searchable, filterable ticket dashboard
- Staff assignment and role management
- Rate limiting on authentication routes to prevent brute force attacks

## Tech Stack
**Frontend:** React.js, Context API, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL  
**Real-time:** Socket.io  
**Auth:** JWT  

## Setup & Installation
### Backend
cd server
npm install
node server.js

### Frontend
cd frontend
npm install
npm run dev

## Environment Variables
Create a `.env` file in `/server`:
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret

## Test Credentials
- **Admin:** admin1234@gmail.com / admin1234
- **Customer:** register normally