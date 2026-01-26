# 📚 AIMS – Academic Information Management System

A full-stack platform designed to streamline academic data handling, student records, and role-based access. Built with modern technologies for seamless performance across web and mobile.

### 🚀 Tech Stack
- **Frontend (Web):** React + Vite  
- **Mobile App:** React Native + Expo  
- **Backend API:** Node.js + Express  
- **Authentication:** Supabase  
- **Access Control:** Role-based (Admin / Faculty / Student)

---

## 🧱 Project Structure

```
D13_AIMS/
│
├── backend/     # Node.js + Express REST API
├── frontend/         # React (Vite) web dashboard
└── mobile/      # React Native (Expo) mobile app
```

---

## 🔧 Prerequisites

Before starting, ensure the following are installed:

- **Node.js** (v18 or higher) → [https://nodejs.org](https://nodejs.org)  
- **npm** (bundled with Node.js)  
- **Git**  
- **Expo CLI**



### For mobile testing:
- Install **Expo Go** app on your smartphone.  
- Ensure your **phone and laptop are on the same Wi-Fi network**.

---

## 🗄️ Environment Variables

### Backend (`backend/.env`)
```
PORT=5050
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=###########
GOOGLE_CLIENT_SECRET=#########3
GOOGLE_REDIRECT_URI=http:##########3
GEMINI_API_KEY=#########3
```

### Web App (`frontend/.env`)
```
VITE_BACKEND_URL=http://localhost:5050
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Mobile App (`aims-mobile/.env`)
```
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5050
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

> **Replace `<YOUR_LAN_IP>`** with your local network IP address.
> use ifconfig/ipconfig 

---

## 🧩 Running the Applications

### 🚀 **Start the Backend**
```bash
cd backend
npm install
npm run dev
```
**Backend runs at:** [http://localhost:5050](http://localhost:5050)

**Health Check:** `GET /health`

---

### 🌐 **Run the Web App**
```bash
cd frontend
npm install
npm run dev
```
**Open in browser:** [http://localhost:5173](http://localhost:5173)

---

### 📱 **Run the Mobile App (Expo)**
```bash
cd aims-mobile
npm install
npx expo start
```

**Options:**
- 📱 Scan QR code using **Expo Go**
- 💻 Press `w` for web preview
- 🤖 Press `a` for **Android Emulator**

---

## 🔐 Authentication Flow

1. **Login** handled entirely via **Supabase Auth** (no custom password routes)
2. Supabase creates a **session** after successful login
3. Backend endpoint `/auth/me/role` returns user **role**
4. App **redirects** based on role:

| Role | Dashboard | Key Features |
|------|-----------|--------------|
| **Admin** | `/admin` | Semesters, departments, approvals |
| **Faculty** | `/faculty` | Courses, enrollments, meetings |
| **Student** | `/student` | GPA, transcripts, chatbot |

**Backend enforces role access** using middleware on all protected routes.

---

## 👥 Role-Based Access

| Role | Permissions |
|------|-------------|
| **Admin** | Manage semesters, departments, approvals |
| **Faculty** | Courses, enrollments, meetings |
| **Student** | View enrollments, GPA, transcripts, chatbot |

---

## 👥 SignIn as Admin

| Email | Password |
|------|-------------|
| admin@test.com| admin123 |

---

## 👥 SignIn as Student

| Email | Password |
|------|-------------|
| 2023csb1091@iitrpr.ac.in| Start123! |

---

## 👥 SignIn as Faculty

| Email | Password |
|------|-------------|
| 2023csb1091+faculty@iitrpr.ac.in| Start123! |
| 2023csb1091+balwinder@iitrpr.ac.in| Start123! |

---


## 📝 Quick Setup Commands

git clone <https://github.com/AbhijeetKamboj/AIMS-Portal-DEP/tree/prabal-backup>
cd AIMS/backend && npm i && npm run dev &
cd ../frontend && npm i && npm run dev &
cd ../aims-mobile && npm i && npx expo start
```

---

