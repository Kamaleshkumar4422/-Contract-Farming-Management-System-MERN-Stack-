# 🌾 AgriFlow - Contract Farming Management System (MERN Stack)

> A full-stack web application connecting farmers with contracting companies/buyers to manage the complete contract farming lifecycle: **land registration, forward contracts, farmer proposals, crop stage tracking, field extension audits, AI disease diagnosis, quality grading, and automated milestone escrow payouts.**

---

## 🌟 Key Highlights & Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti, QRCode.react
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB & Mongoose (with built-in automated in-memory MongoDB fallback for instant zero-config testing)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing & Role-Based Access Control (RBAC)
- **API Communication**: Axios with auto token-injection interceptors

---

## 👥 4 Tailored Role Portals

| Role | Demo Login Email | Password | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@krishiseva.com` | `Password123!` | Farm GIS mapping, Browse & apply for contracts, Crop milestone velocity updates, Field audit reports, Quality & payment passbook, Dispute grievance lodging. |
| **Buyer** | `buyer@greenharvest.com` | `Password123!` | Contract Studio to issue contracts, Applicant review desk, Real-time crop telemetry, Quality grading lab (Grades A+/A/B), Escrow fund releases. |
| **Field Officer** | `officer@agriinspect.gov` | `Password123!` | Extension inspection pad, Record crop foliage condition, pest/disease scouting, soil moisture, irrigation status, and issue certified inspection audits. |
| **Admin** | `admin@agriflow.com` | `Password123!` | System Command Center (GMV, acreage), Participant directory with KYC verification & suspension controls, Contract governance, Arbitration tribunal. |

---

## 🚀 Advanced Integrated Features

1. **🌱 AI Crop Yield Predictor**:
   - Calculates projected harvest yields per acre and total volume based on acreage, crop type, soil taxonomy (Black, Alluvial, Clayey Loam, etc.), irrigation system, and seed quality.
2. **🔬 AI Pathology & Crop Disease Scanner**:
   - Diagnoses foliar diseases (Yellow Rust, Bacterial Blight, Early Blight, Charcoal Rot, Pink Bollworm) with confidence percentages, organic biological remedies, and chemical spray guidance.
3. **📍 GPS Cadastral Land Mapper**:
   - Interactive satellite radar map with survey Khata coordinate pins, acreage bounds, and soil profiles.
4. **🌦️ Agrometeorological Weather Radar**:
   - Live farm weather (temperature, humidity, surface moisture, wind) paired with real agronomic spraying and irrigation advisories.
5. **🛡️ Verifiable Digital QR Passports**:
   - Generates real QR codes with cryptographic hashes for field verification by APMC yards and extension officers.
6. **📄 Legal Contract Agreement Formats**:
   - Printable model agreement compliant with standard agricultural contract laws, complete with digital signature stamps.

---

## 📁 Directory Layout

```
foundation/
├── client/                     # React.js Frontend (Vite)
│   ├── src/
│   │   ├── components/         # StatusBadge, MetricCard, Modal, WeatherWidget, AI Modals, QR Passports
│   │   ├── context/            # AuthContext (with 1-click role switcher) & NotificationContext
│   │   ├── pages/
│   │   │   ├── Farmer/         # FarmerPortal (7 sections)
│   │   │   ├── Buyer/          # BuyerPortal (7 sections)
│   │   │   ├── Officer/        # OfficerPortal (4 sections)
│   │   │   ├── Admin/          # AdminPortal (6 sections)
│   │   │   ├── LandingPage.jsx # Hero showcase, live marketplace, lifecycle timeline
│   │   │   ├── LoginPage.jsx   # Login with 1-click role autofill
│   │   │   └── RegisterPage.jsx# Multi-step role registration
│   │   ├── services/           # Axios instance with auth interceptors
│   │   ├── styles/             # Tailwind & glassmorphism CSS
│   │   ├── App.jsx             # Main router and role portal coordinator
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/             # db.js (MongoDB Atlas / Local / In-Memory Fallback)
│   │   ├── models/             # 10 Mongoose Schemas (User, Farm, Contract, Crop, Inspection, etc.)
│   │   ├── middleware/         # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── controllers/        # 11 Controllers covering all 10 modules & AI tools
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # seedData.js (Starter mock dataset) & e2eTest.js
│   │   └── server.js           # Server entry point
│   ├── .env                    # Environment variables
│   ├── .env.example
│   └── package.json
│
└── package.json                # Monorepo root scripts
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- *MongoDB*: Optional! If local MongoDB is not running, the application automatically launches an embedded in-memory MongoDB database so you can test immediately with zero database installation hassle.

### 2. Install Dependencies

From the workspace root directory:
```bash
npm run install:all
```
*(Or install separately: `cd server && npm install`, then `cd ../client && npm install`)*

### 3. Environment Variables
The server `.env` is already configured in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/contract_farming
JWT_SECRET=contract_farming_jwt_super_secret_key_2025
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
*Note: To connect to your MongoDB Atlas cloud cluster, simply update `MONGO_URI` in `server/.env`.*

### 4. Seed Starter Data (Optional)
The database auto-seeds on first boot! You can also re-seed anytime via:
```bash
npm run seed
```

### 5. Launch the Application

Run both backend and frontend concurrently:
```bash
npm run dev
```

Or start them in separate terminals:
- **Terminal 1 (Backend)**:
  ```bash
  npm run start:server
  # Server active at http://localhost:5000/api
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  npm run start:client
  # Client active at http://localhost:5173
  ```

---

## 🧪 Testing the Complete Application

1. Open your browser and navigate to **`http://localhost:5173`**.
2. **Instant Sandbox Testing**:
   - On the Landing Page, click any of the 4 **One-Click Role Cards** (Farmer, Buyer, Field Officer, Admin) or use the **Demo Roles** dropdown in the top navbar.
3. **Farmer Experience**:
   - Browse open buyback contracts in the **Contract Marketplace**.
   - Inspect your plots with the **GPS Cadastral Map**.
   - Progress your crop growth stages and view the printable **Legal Agreement**.
4. **Buyer Experience**:
   - Issue a new procurement contract in the **Contract Studio**.
   - Review and accept farmer applications.
   - Conduct harvest evaluation in the **Quality Grading Lab** and release escrow payouts.
5. **Field Officer Experience**:
   - Open the **Digital Inspection Pad** to record crop foliage, pest risks, and certify audits.
6. **Platform Admin Experience**:
   - Review platform GMV, suspend or verify users in the **User Directory**, and arbitrate disputes.
7. **AI Agronomy Tools**:
   - Click **Yield Forecaster** or **AI Crop Pathology** in the top navigation bar at any time.

---

## 🔒 Security Measures
- Passwords salted and hashed with `bcryptjs` (salt factor 10).
- Stateless authorization via signed `jsonwebtoken` (JWT).
- Strict Role-Based Access Control (RBAC) middleware verifying route authorization.
- Protection against duplicate submissions and unauthorized contract state modifications.
- Input validation on all numerical yields, moisture limits, and currency amounts.
