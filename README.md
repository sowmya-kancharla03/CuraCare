# 🏥 CuraCare — Hospital Appointment Booking System (MERN Stack)

CuraCare is a full-stack healthcare management web application designed to simplify patient–doctor interactions. It enables patients to book appointments online, consult doctors digitally, and manage their medical consultations efficiently. The platform offers secure authentication, role-based dashboards, and an intuitive interface for all users.

---

## 🚀 Features

- 👩‍⚕️ **Role-based Access:** Separate interfaces for Admins, Doctors, and Patients  
- 📅 **Appointment Booking:** Patients can book, reschedule, or cancel appointments  
- 🩺 **Doctor Management:** Doctors can manage their availability and consultations  
- 🔒 **Secure Authentication:** JWT-based login and route protection  
- 📨 **Notifications:** Real-time updates for appointments and approvals  
- 📊 **Admin Dashboard:** Admins can monitor system activity and user accounts  
- 🧠 **Responsive Design:** Works seamlessly on desktop and mobile devices  

---

## 🧩 Tech Stack

**Frontend:** React.js, HTML5, CSS3, JavaScript, Axios  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas (Mongoose ORM)  
**Authentication:** JSON Web Tokens (JWT), bcrypt.js  
**Hosting:** Render / Vercel / AWS  

---
## ⚙️ Installation and Setup

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CuraCare.git
```
### 2. Navigate into the project folder
```bash
cd CuraCare
```
### 3. Install dependencies for both backend and frontend
```bash
# Install server dependencies
npm install

# Move to client directory and install frontend dependencies
cd client
npm install
```

### 4. Set up Environment Variables

Create a .env file in the root directory and add:
```
MONGO_URI = your_mongodb_connection_string
JWT_SECRET = your_jwt_secret
PORT = 5000
```
### 5. Run the Application

In the root folder:
```bash
# Run both frontend and backend together (if using concurrently)
npm run dev

# OR run individually
npm run server     # for backend
npm start          # inside client folder for frontend
```

The app will run at:
```bash
👉 http://localhost:3000 (Frontend)
👉 http://localhost:5000 (Backend)
```
---

## 📦 Folder Structure
```bash
CuraCare/
│
├── client/              # React frontend
├── models/              # Mongoose schemas (User, Doctor, Appointment)
├── routes/              # Express routes and APIs
├── middleware/          # Auth and role-based access middleware
├── controllers/         # Business logic for routes
├── config/              # Database and server config files
└── server.js            # Entry point for backend
```

---

## 🔐 Security Features

JWT-based authentication for secure access

Password encryption using bcrypt.js

Protected API routes for doctors, patients, and admins

Role-based middleware for data access control

---

## 💡 Future Enhancements

📞 Telemedicine integration (video consultations)

💳 Online payment gateway

📈 Doctor and admin analytics dashboard

🏥 Electronic Health Records (EHR) integration
