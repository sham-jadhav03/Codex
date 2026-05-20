<div align="center">

# ✦ Codex AI Code Editor

**A full-stack, AI-powered browser-based development platform.**

*Generate, edit, run, and collaborate on code — all inside your browser.*

[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)

</div>

---

## 🚀 Overview

**Codex AI Code Editor** is a powerful, full-stack development environment that runs entirely in the browser. It combines **Google Gemini AI** for intelligent code generation, **WebContainers** for real Node.js execution without leaving the browser, and **Socket.io** for real-time multi-user collaboration — all built on the **MERN stack**.

> Simply describe what you want to build, and the AI generates a complete, runnable project structure for you. Collaborate with teammates in real time, explore the file tree, edit code, and see it run — live.

---

## ✨ Key Features

### 🤖 AI-Powered Code Generation
- Integrated with **Google Gemini** (`@google/genai` + `@google/generative-ai`)
- Mention `@ai` in the project chat to trigger AI assistance
- AI parses natural language prompts and returns a structured **file tree** with complete code
- Responses are rendered with **syntax highlighting** (via `highlight.js`) and **Markdown** (via `markdown-to-jsx`)

### ⚡ Real-Time Collaboration
- Powered by **Socket.io** (v4) — users in the same project share a real-time room
- Project chat with live message broadcasting
- AI responses are emitted to all connected users simultaneously

### 🖥️ In-Browser Code Execution
- Uses **WebContainers** (`@webcontainer/api`) to run a full Node.js environment in the browser
- Live terminal output and filesystem emulation — no server-side sandbox needed
- Integrated **File Explorer** and **Code Editor** components for intuitive navigation

### 🔐 Secure Authentication
- **JWT (JsonWebToken)** based stateless auth with `bcrypt` password hashing
- Persistent sessions via **HTTP-only cookies** and `cookie-parser`
- Input validation via `express-validator`
- Protected API routes and Socket.io middleware

### 📂 Project Management
- Create and manage multiple coding projects per user
- Each project has its own isolated workspace, file tree, and collaboration room
- Add/remove collaborators to shared projects

### 🎨 Modern UI/UX
- Built with **React 19** + **Vite** for blazing-fast HMR
- Styled with **Tailwind CSS v3** and **PostCSS**
- Smooth transitions with **Framer Motion**
- Icons from **Remix Icon**
- Responsive design with a clean, dark-themed aesthetic

---

## 🏗️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | UI framework & dev server |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [Socket.io Client](https://socket.io/) | Real-time communication |
| [WebContainers API](https://webcontainers.io/) | In-browser Node.js runtime |
| [Axios](https://axios-http.com/) | HTTP requests |
| [React Router DOM v7](https://reactrouter.com/) | Client-side routing |
| [highlight.js](https://highlightjs.org/) | Syntax highlighting |
| [markdown-to-jsx](https://www.npmjs.com/package/markdown-to-jsx) | Markdown rendering |
| [Remix Icon](https://remixicon.com/) | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) | REST API server |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Database & ODM |
| [Socket.io](https://socket.io/) | WebSocket server for real-time events |
| [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) | Gemini AI integration |
| [Redis](https://redis.io/) (`ioredis`) | Caching layer |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | JWT authentication |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing |
| [express-validator](https://express-validator.github.io/) | Input validation |
| [Morgan](https://www.npmjs.com/package/morgan) | HTTP request logging |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |

---

## 📂 Project Structure

```
Codex/
├── backend/
│   ├── src/
│   │   ├── config/              # Database & Cache connection (db.js, cache.js)
│   │   ├── controllers/
│   │   │   ├── ai.controller.js       # AI prompt handler
│   │   │   ├── auth.controller.js     # Register / Login / Logout / Profile
│   │   │   └── project.controller.js  # CRUD + collaborator management
│   │   ├── middleware/          # JWT auth & Redis Blacklist middleware
│   │   ├── models/
│   │   │   ├── user.model.js          # User schema (Mongoose)
│   │   │   └── project.model.js       # Project schema with collaborators
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # /api/auth/*
│   │   │   ├── project.routes.js      # /projects/*
│   │   │   └── ai.routes.js           # /ai/*
│   │   ├── services/
│   │   │   ├── ai.service.js          # Gemini AI generation logic
│   │   │   ├── auth.service.js        # Auth business logic
│   │   │   └── project.service.js     # Project business logic
│   │   ├── validators/          # express-validator rule sets
│   │   └── app.js               # Express app setup & middleware
│   ├── server.js                # HTTP server + Socket.io setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Application Entry and Routing
│   │   │   ├── routes/          # React Router route definitions (AppRoutes.jsx)
│   │   │   ├── App.jsx          # Main application wrapper
│   │   │   └── index.css        # Global Tailwind CSS
│   │   ├── features/            # 4-Layer Architecture Implementation
│   │   │   ├── components/      # UI Layer: Reusable UI (Protected, CodeEditor)
│   │   │   ├── context/         # State Layer: Global state (UserContext)
│   │   │   ├── hooks/           # Hooks Layer: Logic orchestration (useAuth, useProject)
│   │   │   ├── pages/           # UI Layer: Main route pages
│   │   │   │   ├── auth/        # Login.jsx, Register.jsx
│   │   │   │   └── project/     # Home.jsx, Project.jsx
│   │   │   ├── services/        # API Layer: Backend communication (auth.api.js, project.api.js)
│   │   │   └── config/          # Socket.io, WebContainers, and Axios configs
│   │   └── main.jsx             # React DOM entry point
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── Readme.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **v18 or higher** (`node -v`)
- [npm](https://www.npmjs.com/) v8+ (bundled with Node.js)
- [MongoDB](https://www.mongodb.com/) (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- [Redis](https://redis.io/) (local installation or [Upstash](https://upstash.com/) cloud instance)
- A **Google Gemini API Key** — get one free at [ai.google.dev](https://ai.google.dev/)

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd saas
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/codex-ai-db

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Google Gemini AI
GOOGLE_AI_KEY=your_gemini_api_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

Start the backend server:

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
node server.js
```

> The backend will start at `http://localhost:3000`

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

> The frontend will start at **`http://localhost:5173`**

---

### 4. Open the App

Navigate to `http://localhost:5173` in your browser.

1. **Register** a new account
2. **Create a project** from the Home dashboard
3. In the project workspace, type `@ai <your prompt>` in the chat to generate code
4. Browse the generated **file tree**, open files in the **code editor**, and run the project in the **WebContainer terminal**

---

## 🔌 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Log in and receive a JWT cookie |
| `GET` | `/logout` | Clear the auth cookie and log out |
| `GET` | `/profile` | Get the logged-in user's profile |

### Project Routes — `/api/project`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/create` | Create a new project |
| `GET` | `/all` | Get all projects for the current user |
| `GET` | `/:projectId` | Get a single project by ID |
| `PUT` | `/add-user` | Add a collaborator to a project |

### AI Routes — `/api/ai`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/get-result` | Send a prompt and receive an AI-generated file tree |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**

Please follow conventional commit messages and ensure your code passes linting before submitting.

---

## ⚠️ Disclaimer

This project is a personal/educational implementation of an AI-powered code editor, inspired by similar SaaS development tools. It uses **Google Gemini API** for AI features — a valid API key is **required** for the AI functionality to work. Usage of the Gemini API is subject to [Google's Terms of Service](https://ai.google.dev/terms) and data usage policies.

---

<div align="center">

Made with ❤️ using the MERN Stack + Google Gemini AI

</div>