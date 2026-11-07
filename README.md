# MOVA - Last-Mile Logistics & Dispatch Operations Platform

MOVA is a full-stack last-mile operations dashboard and logistics management platform featuring interactive delivery tracking, dispatch management, telemetry status cards, driver fleet monitoring, and real-time CRUD operations.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Zod Schema Validation, Mongoose (MongoDB)
- **Persistence**: MongoDB (with seamless in-memory fallback for local development)

---

## 🚀 Quick Start (Run Locally)

### 1. Install Dependencies

```bash
# Install root (frontend + tooling) dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment

Copy the example environment files (pre-configured defaults are provided):

```bash
# Frontend (.env)
cp .env.example .env

# Backend (server/.env)
cp server/.env.example server/.env
```

Default configuration:
- Frontend: `VITE_API_URL=http://localhost:5000`
- Backend: `PORT=5000`, `MONGODB_URI=mongodb://localhost:27017/mova` (if MongoDB is not running, the server automatically operates in local in-memory mode).

### 3. Run Locally

You can run both client and server concurrently with a single command:

```bash
npm run dev:all
```

Or run them individually in separate terminal sessions:

```bash
# Terminal 1: Start frontend (Vite)
npm run dev

# Terminal 2: Start backend (Express + tsx watch)
npm run server
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Deliveries API**: [http://localhost:5000/api/deliveries](http://localhost:5000/api/deliveries)

---

## 📦 Build for Production

```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# Run backend production server
npm run server:start
```
