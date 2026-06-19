# CAL-C-PAD (MathVerse)

An advanced, full-stack educational platform that transforms handwritten equations, geometric drawings, and complex physics free-body diagrams into step-by-step mathematical solutions. Powered by a specialized multi-tool interactive canvas, a secure token-based authentication system, and the generative reasoning capabilities of Gemini 2.5 Flash.

## 🚀 Live Demo

* **Frontend (Vercel):** [Your-Vercel-Deployment-URL]
* **Backend API (Render):** `https://ai-i-pad-style-calculator.onrender.com`

---

## 🛠️ Architecture & Core Features

```
[React Glassmorphic UI] ──(JWT Auth Header)──> [Express Gateway] ──> [Gemini 2.5 Flash]
         │                                              │                     │
         └── (Canvas Multi-Step State Machine)          └──> [MongoDB Atlas] <┘

```

### 1. Advanced Interactive Canvas (Frontend Engine)

* **Multi-Step Drawing State Machine:** Moves beyond standard path tracing to support complex geometric tools:
* **Freehand Pen & Eraser:** Standard point-to-point drawing and background-color pixel masking for seamless erasure.
* **Transformed Geometric Shapes:** Mathematical tracking of origin coordinates to generate real-time previews for lines, rectangles, circles, and directional vector arrows.
* **Elastic Curve Tool:** A two-step rendering engine utilizing Quadratic Bezier Curves, allowing users to draw a vector and dynamically bend it via a third anchor point (mimicking native vector diagram workflows).
* **HTML Dynamic Text Overlays:** On-canvas coordinate capturing that spawns floating inputs, stamping label criteria directly into the canvas bitmask data stream.


* **Global Security Context:** Managed via the React Context API (`AuthContext`), maintaining token validation states globally and automatically mutating UI elements across components.
* **Responsive Fluid Grid:** Custom element listener configurations tracking client-width mutations, programmatically cloning existing canvas contexts to prevent pixel-loss during viewport shifts on mobile displays.

### 2. Secure Gateway & Rate Limiting (Backend Engine)

* **JWT Access Controls:** Strict authorization gates protecting computational endpoints. Passwords undergo cryptographic salting and hashing protocols via `bcryptjs` before committing to storage layers.
* **Express Security Hardening:** Integration of `express-rate-limit` windowing to restrict calculations to a maximum of 20 operations per 15-minute interval per unique IP address, mitigating malicious server overhead and quota drains.
* **NoSQL Persistence Layer:** Mongoose schemas structuring user indexing metrics alongside historical calculation streams.

### 3. Specialized AI Inference Engine

* **Prompt Engineering Strategy:** Implementation of a strict "God-Mode" prompt constraining the Gemini 2.5 Flash model to bypass conversational fluff and output structural, single-block math strings.
* **Sanitization Post-Processing Wrapper:** Advanced regex pipelines running inside Express controllers to scrub markdown blocks, document wrappers (`\documentclass`), and text delimiters (`$`), serving raw, compliant KaTeX data directly to the frontend.
* **Accordion Token Splitting:** The frontend history dashboard automatically intercepts the double-backslash (`\\`) LaTeX layout markers, isolating the primary structural equation block to serve as a clean, expandable tab summary.

---

## 💻 Tech Stack

* **Frontend:** React.js, Vite, HTML5 Canvas API, React-KaTeX, CSS3 (Glassmorphism design language)
* **Backend:** Node.js, Express.js, Google Gen AI SDK
* **Database:** MongoDB Atlas, Mongoose ODM
* **Security:** JSON Web Tokens (JWT), BcryptJS, Express Rate Limit

---

## 📂 Repository Layout

```
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Express App, Auth Routes, DB configuration, AI pipeline
└── src/
    ├── assets/             # Global media files and branding logos
    ├── components/
    │   ├── AuthModal.jsx        # Glassmorphic Login/Register component
    │   ├── HistorySidebar.jsx   # Collapsing Accordion History component
    │   └── MathCanvas.jsx       # State-machine vector engine & rendering core
    ├── context/
    │   └── AuthContext.jsx      # Global security and state-of-truth router
    ├── App.jsx
    ├── main.jsx
    └── index.css

```

---

## 🔑 Environment Variables Configuration

### Backend (`/backend/.env`)

Create a `.env` file inside the root backend directory:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_advanced_api_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mathverse?retryWrites=true&w=majority
JWT_SECRET=your_long_cryptographically_secure_secret_string_here

```

---

## ⚙️ Local Development Setup

### Prerequisite Installation

* Node.js (v18.x or higher)
* npm (v9.x or higher)
* Active MongoDB Atlas Cluster

### 1. Backend Service Launch

```bash
cd backend
npm install
npm run start # Starts execution on http://localhost:3000

```

### 2. Frontend Application Launch

```bash
# From the root directory
npm install
npm run dev # Starts development server via Vite

```

---

## 📡 API Reference Documentation

### Authentication Endpoints

#### User Registration

* **Endpoint:** `POST /api/register`
* **Payload:** ```json
{ "username": "developer_test", "password": "securepassword123" }
```

```


* **Response Status:** `201 Created`

#### User Login

* **Endpoint:** `POST /api/login`
* **Payload:** ```json
{ "username": "developer_test", "password": "securepassword123" }
```

```


* **Response Status:** `200 OK`
* **Returns:** Token authorization string:
```json
{ "token": "eyJhbGciOiJIUzI1NiIsIn...", "message": "Logged in successfully!" }

```



---

### Protected Calculation Endpoints

#### Evaluate Drawing Data

* **Endpoint:** `POST /api/solve`
* **Headers Required:** `Authorization: Bearer <JWT_TOKEN>`
* **Payload:**
```json
{ "image": "data:image/png;base64,iVBORw0KGgoAAA..." }

```


* **Response Status:** `200 OK`
* **Returns:** Sanitized KaTeX block.

#### Retrieve Calculation Records

* **Endpoint:** `GET /api/history`
* **Headers Required:** `Authorization: Bearer <JWT_TOKEN>`
* **Response Status:** `200 OK`
* **Returns:** Chronological array matching indexed User Database ID.

---

## 🔒 Production Security Architecture Decisions

1. **State Injection Isolation:** Canvas parameters separate runtime transformations from committed pixels, isolating mouse coordinate streams to prevent component redraw overhead.
2. **Text Wrapping Overrides:** Overrode strict global KaTeX layout behaviors using explicit CSS properties (`white-space: normal` targeted at `.katex .text` elements) to secure total responsiveness on smaller viewports.
3. **NoSQL Payload Capacity:** Set target Express body parser parsing limits explicitly to `50mb` (`express.json({ limit: '50mb' })`) to accommodate extensive canvas base64 image data structures without triggering resource exhaust failures.