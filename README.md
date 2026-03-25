# Delivray - Delivery Aggregator Platform

A high-fidelity delivery platform with role-based portals for Customers, Merchants, Drivers, and Admins.

## Tech Stack
- **Frontend**: Next.js, Framer Motion, Lucide React, Zustand
- **Backend**: Express, Socket.io, Supabase, JWT
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Local Development

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm run install-all
   ```
3. **Environment Setup**
   - Copy `backend/.env.example` to `backend/.env` and fill in Supabase/JWT credentials.
   - Copy `frontend/.env.example` to `frontend/.env.local`.
4. **Run both servers**
   ```bash
   npm run dev
   ```

## Deployment Configuration

### Frontend (Vercel)
- **Framework Preset**: Next.js
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: URL of your deployed backend (e.g., `https://api.yourdomain.com`).

### Backend (Railway)
- **PORT**: Automatically assigned by Railway.
- **Environment Variables**:
  - `SUPABASE_URL`: Your Supabase project URL.
  - `SUPABASE_KEY`: Your Supabase service role key.
  - `JWT_SECRET`: Secret for signing tokens.
  - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://delivray.vercel.app`).
