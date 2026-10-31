# FoodBridge — Surplus Food Redistribution Platform
**Student Hackathon Project Code: HACK-P197**

[![Status: Production-Quality](https://img.shields.io/badge/Status-Complete%20%26%20Functional-10b981?style=for-the-badge)](https://github.com)
[![Frontend: React + Vite + TS](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript%20%2B%20Tailwind-38bdf8?style=for-the-badge)](https://vitejs.dev)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLAlchemy-059669?style=for-the-badge)](https://fastapi.tiangolo.com)
[![Database: PostgreSQL / SQLite](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791?style=for-the-badge)](https://www.postgresql.org)

---

## 🥗 Executive Summary

Every day, commercial kitchens, bakeries, caterers, and supermarkets discard fresh surplus food due to scheduling overages or minor cosmetic imperfections, while nearby emergency shelters and community pantries struggle to secure nutritious meals.

**FoodBridge (HACK-P197)** is a modern, production-quality surplus food redistribution platform that connects commercial food donors with verified charitable non-profit organizations. Built with strict safety controls, atomic double-booking prevention, real-time custody verification, and impact analytics.

---

## 🚀 Key Features

### 1. Role-Based Authentication & Verification
- **Donors**: Restaurants, caterers, bakeries, grocers, and community kitchens create and manage listings.
- **Recipients**: Charitable 501(c)(3) organizations, shelters, and food banks undergo compliance verification before claiming donations.
- **Admin**: Platform administrators verify non-profits, moderate listings, handle incident reports, and review immutable audit logs.
- **1-Click Demo Persona Switcher**: Instant switching between 9 realistic demo accounts in the UI.

### 2. Donor Dashboard & Food Listing Lifecycle
- Real-time creation of food donation listings with:
  - Title, description, and food category (`Cooked Meals`, `Bakery & Pastries`, `Fresh Produce`, `Dairy & Chilled`, `Pantry Staples`, `Beverages`).
  - Quantity, unit, and **live automated calculation of equivalent meal portions** (UN FAO standard ~0.42 kg/meal).
  - Preparation timestamp and strict future use-by expiration validation.
  - Temperature & storage conditions: `Hot-Holding (> 140°F / 60°C)`, `Refrigerated (< 41°F / 5°C)`, `Ambient / Room Temp`, `Frozen (< 0°F / -18°C)`.
  - Comprehensive allergen disclosures and dietary tags (`Vegetarian`, `Vegan`, `Halal`, `Gluten-Free`, `Nut-Free`).
  - Pickup location, dock loading instructions, and availability window.
  - **Mandatory Food-Safety Certification**: Donors must certify local health code adherence.

### 3. Recipient Discovery & Interactive Rescue Map
- **Interactive Leaflet Map**: Geo-located food donation pins color-coded by category with live distance indicators.
- **Multi-parameter Filter Toolbar**: Search keywords, food categories, dietary tags, storage requirements, and urgent countdowns (`Expiring < 3h`).
- **Claim Request Flow**: Specify transport type (`Refrigerated Van`, `Thermal Insulated Bags`, `Standard Vehicle`), volunteer arrival ETA, and emergency driver phone.

### 4. Strict State Machine & Double-Booking Prevention
```
  [AVAILABLE] ───────────► [RESERVED] ───────────► [PICKED_UP] ───────────► [COMPLETED]
       │                       │
       ▼                       ▼
   [EXPIRED]             [CANCELLED] (Reverts listing to AVAILABLE)
```
- **Atomic Lock Transitions**: When a donor accepts a request, the listing is locked and reserved. All other competing requests for that listing are automatically updated to `REJECTED` with clear explanation notes.
- **Automatic Expiration**: Any unreserved listing whose pickup deadline elapses automatically transitions to `EXPIRED`.
- **Safe Cancellation**: If an accepted charity cancels, the listing reverts back to `AVAILABLE` for another organization to claim.
- **4-Digit Pickup Security PIN**: Unique verification code generated per listing. The arriving driver or donor inputs the PIN to authenticate physical custody handover.
- **On-Site Inspection Checklist**: Mandatory 3-step verification (Temperature, Sealed Packaging, Visual/Aroma) before digital sign-off.

### 5. Admin Moderation & Incident Management
- **Charity Verification Queue**: Review 501(c)(3) registration numbers, vehicle refrigeration capabilities, and mission statements with 1-click Approve/Reject.
- **Listing Oversight**: Force remove or cancel inappropriate listings.
- **Incident Reports**: Users can flag mislabeled allergens, spoiled items, or no-shows. Admins resolve or dismiss with notes.
- **Audit Activity Log**: Immutable log of every platform action and status transition with timestamps.

### 6. Environmental & Community Impact Dashboard
- Live aggregate metrics: Total donations completed, total kg saved, estimated meals provided, CO₂e avoided (EPA factor 2.5 kg CO₂e / kg food), water conserved (1,000 L / kg).
- Redistributed volume breakdown by category with responsive progress bars.
- Top Donors Leaderboard & Top Charitable Distribution Hubs.
- Live recent verified handovers activity feed.
- Printable Impact Certificate for donors and corporate ESG reporting.

### 7. Food-Safety Governance Notice
> **Important Food Safety Disclaimer:**
> In accordance with the Bill Emerson Good Samaritan Food Donation Act, FoodBridge facilitates communication and logistics. **FoodBridge does not inspect, test, or certify food safety.** Donors certify compliance with applicable local health regulations; recipients perform on-site visual and temperature inspections prior to acceptance.

---

## 👥 Realistic Pre-Seeded Demo Accounts

Evaluators can log in using either the **1-Click Demo Switcher** in the top navigation bar or with the credentials below:

| Persona | Organization | Role | Email | Password |
|---|---|---|---|---|
| **Sarah Jenkins** | FoodBridge Governance | **Admin** | `admin@foodbridge.org` | `demo1234` |
| **Marco Rossi** | The Artisan Bakehouse | **Donor** (Bakery) | `artisan@bakehouse.com` | `demo1234` |
| **Chef Linda Vance** | Golden Platter Hospitality | **Donor** (Caterer) | `catering@goldenplatter.com` | `demo1234` |
| **David Chen** | Metro Fresh Organics | **Donor** (Supermarket) | `manager@metrofresh.com` | `demo1234` |
| **Chef Kate Morales** | Sunrise Community Bistro | **Donor** (Kitchen) | `chefkate@sunrisecafekitchen.org` | `demo1234` |
| **Marcus Brody** | City Hope Homeless Shelter | **Recipient** (Verified) | `coordinator@cityhopeshelter.org` | `demo1234` |
| **Sister Evelyn Adams** | Greenleaf Food Pantry | **Recipient** (Verified) | `director@greenleafpantry.org` | `demo1234` |
| **Pastor Jamal** | St. Jude Youth Haven | **Recipient** (Verified) | `contact@stjudeyouthhaven.org` | `demo1234` |
| **Thomas Wright** | Beacon Hill Mission | **Recipient** (Pending) | `help@beaconmission.org` | `demo1234` |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 with TypeScript
  - Tailwind CSS 3
  - Vite 6
  - Lucide React (Icons)
  - Leaflet 1.9 (Interactive OpenStreetMap Integration)
  - Canvas Confetti (Completion celebration)
- **Backend**:
  - FastAPI (Python 3.13)
  - SQLAlchemy 2.0 ORM
  - Pydantic v2 (Validation & Settings)
  - Python-Jose (JWT Authentication)
  - Bcrypt (Secure password hashing)
- **Database**:
  - PostgreSQL 16 (production/Docker ready)
  - SQLite (zero-config local default)

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database seed (Pre-populates 12 realistic listings, 9 accounts, requests, impact)
python -m backend.seed_data

# Start FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: **http://127.0.0.1:8000/docs**

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **http://localhost:5173** in your browser!

### 3. Optional: Running with PostgreSQL via Docker
If you prefer running with PostgreSQL rather than the default SQLite:
```bash
# Start PostgreSQL container
docker-compose up -d

# Set environment variable in backend/.env:
# DATABASE_URL=postgresql://postgres:password123@localhost:5432/foodbridge_db
```

---

## 🧪 Automated Testing
A comprehensive integration test suite verifies the end-to-end donation workflow:
```bash
backend\venv\Scripts\python.exe -m backend.test_api
```
This tests:
1. Health check & status
2. Authentication & demo role switching
3. Food listings filtering & categories
4. Impact metrics calculation
5. Admin endpoints & report retrieval
6. Complete request lifecycle: Request ➔ Prevent duplicate ➔ Accept & atomic reservation ➔ Confirm pickup ➔ 4-digit PIN verification ➔ Complete donation!

---

## 📋 Database Schema & Relationships

```
+--------------------+        +-------------------------+        +-----------------------+
|       users        |        |      food_listings      |        |   donation_requests   |
+--------------------+        +-------------------------+        +-----------------------+
| id (PK)            | 1    * | id (PK)                 | 1    * | id (PK)               |
| email              |◄───────| donor_id (FK)           |◄───────| listing_id (FK)       |
| full_name          |        | title                   |        | recipient_id (FK)     |
| role               |        | category                |        | status                |
| org_name           |        | quantity, unit, meals   |        | transport_type        |
| verification_status|        | storage_requirement     |        | estimated_pickup_time |
| refrigerated_fleet |        | use_by_time             |        | contact_phone         |
| charity_reg_number |        | pickup_code (PIN)       |        | completed_at          |
+--------------------+        | status                  |        +-----------------------+
                              +-------------------------+
                                           │ 1
                                           │ *
                              +-------------------------+
                              |         reports         |
                              +-------------------------+
                              | id (PK)                 |
                              | listing_id (FK)         |
                              | reporter_id (FK)        |
                              | reason, details, status |
                              +-------------------------+
```

---

## 🏆 Hackathon Compliance Checklist (HACK-P197)

- [x] **Role-Based Authentication**: Donors, Verified Recipients, and Admins.
- [x] **Donor Dashboard**: Create, edit, manage, and cancel listings with preparation time, use-by deadlines, storage guidance, allergens, and availability windows.
- [x] **Recipient Dashboard**: Discover food, interactive Leaflet map, distance sorting, active claim tracking, and pickup checklist.
- [x] **Complete Request Workflow**: Request ➔ Accept ➔ Reject ➔ Cancel ➔ Confirm Pickup ➔ Mark Completed with 4-digit security PIN verification.
- [x] **Safety & Concurrency**: Atomic double-booking prevention, query-level expiration auto-detection, and unauthorized action barriers.
- [x] **Admin Dashboard**: Manage users, verify non-profit 501(c)(3) documentation, moderate listings, and resolve incident reports.
- [x] **Realistic Demo Data**: 12 diverse listings, 4 commercial donors, 3 verified charities + 1 pending charity, and platform admin.
- [x] **Impact Dashboard**: Live meals provided, kg redistributed, CO₂e avoided, water conserved, category charts, and donor hero leaderboard.
- [x] **Food-Safety Governance**: Mandatory donor certification, Good Samaritan notices, and recipient inspection protocol.

---
*Created for Student Hackathon HACK-P197.*
