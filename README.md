# NoteGuard | Secure Note Sharing Platform 2024

 A full-stack encrypted note-sharing application with expiring shareable links, built with security and scalability in mind.

---

## 🚀 Features

- 🔐 AES-based **end-to-end encryption** for all notes
- 🛡️ **JWT authentication** with role-based access control
- 📅 **Expiring shareable links** with automatic cleanup via Spring Scheduler
- 📊 **Admin dashboard** for monitoring users and moderating content
- 📱 Responsive, AI-inspired modern UI built with React + TypeScript
- 🗄️ MySQL database with clean REST API design

---

## 🛠️ Tech Stack

**Frontend:** React, TypeScript  
**Backend:** Spring Boot, Java  
**Database:** MySQL  
**Auth:** JWT   
**Encryption:** AES  
**Others:** Spring Scheduler, REST APIs

---

## 📸 Screenshots

- Landing Page
<img width="1897" height="1079" alt="Screenshot 2025-09-09 151349" src="https://github.com/user-attachments/assets/6411193b-e106-4665-8669-1f0af38505b1" />

- Dashboard 
 <img width="1895" height="1079" alt="Screenshot 2025-09-09 151419" src="https://github.com/user-attachments/assets/4cafdf94-041f-4af7-8213-34ef64bb7fa1" />


- Notes
 <img width="1919" height="932" alt="Screenshot 2025-09-09 154948" src="https://github.com/user-attachments/assets/393a07bb-8859-45a6-9e54-86194bbbd23c" />


---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 16
- Java 17+
- MySQL running locally or a cloud instance

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

The backend runs by default on: `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs by default on: `http://localhost:3000`

---

## 📂 Project Structure

```
NoteGuard/
├── backend/        # Spring Boot backend (Java + MySQL)
├── frontend/       # React + TypeScript frontend
├── assets/         # Screenshots, logos, etc.
└── README.md
```

---

## 🌐 Deployment

- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / AWS / DigitalOcean
- **Database:** Railway / PlanetScale / AWS RDS

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork, raise issues, and submit PRs.

---

## 📜 License

This project is licensed under the MIT License.
