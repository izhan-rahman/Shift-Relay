# Shift Relay — Backend Integration Plan

## Overview

This document outlines how to connect the Shift Relay web app to **Google Sheets** so the MD can manage all employee shifts, logins, and schedules from a single spreadsheet — no coding required.

---

## Architecture

```
┌──────────────────────┐       Google        ┌──────────────────────┐       HTTP API       ┌──────────────────┐
│                      │    Sheets API       │                      │                      │                  │
│   GOOGLE SHEET       │ ──────────────────► │   NODE.JS SERVER     │ ◄──────────────────► │   REACT FRONTEND │
│   (MD updates here)  │   reads every 5min  │   (server.cjs)       │   polls every 1sec   │   (localhost:5173)│
│                      │                     │   Port 3001          │                      │                  │
└──────────────────────┘                     └──────────────────────┘                      └──────────────────┘

         MD edits                        Caches data in memory                      Displays live relay
     shifts & users                    Handles login/logout                        Shows shift progress
    in the spreadsheet                 Tracks real-time state                      Light/Dark theme
```

---

## Google Sheet Structure

The MD maintains **one Google Sheet** with the following tabs:

### Tab 1: `Employees`

| Column | Description | Example |
|--------|-------------|---------|
| **Name** | Employee display name (used for login) | SUHAIL |
| **Password** | Login password | suhail123 |
| **Department** | Team/department name | Operations |
| **Role** | `employee` or `master` | employee |
| **Status** | `active` or `inactive` | active |

### Tab 2: `Schedule`

| Column | Description | Example |
|--------|-------------|---------|
| **Name** | Must match an employee name | SUHAIL |
| **Shift Start** | Shift start time (12h or 24h) | 9:00 AM |
| **Shift End** | Shift end time | 6:00 PM |
| **Days** | Which days this applies | Mon,Tue,Wed,Thu,Fri |
| **Effective From** | Start date for this schedule | 2026-02-01 |
| **Effective Until** | End date (blank = ongoing) | 2026-02-28 |
| **Order** | Relay order (1, 2, 3...) | 1 |

### Tab 3: `Settings` (Optional)

| Key | Value | Description |
|-----|-------|-------------|
| company_name | Shift Relay Co. | Shown in the app header |
| sync_interval | 5 | How often to sync (minutes) |
| relay_mode | sequential | `sequential` or `parallel` |

---

## What the MD Does

1. **Opens the Google Sheet** (shared link)
2. **Adds/removes employees** in the `Employees` tab
3. **Updates shift timings** in the `Schedule` tab
4. **That's it** — the app picks up changes automatically within 5 minutes

### Example: Adding a New Employee

The MD adds a row to the `Employees` tab:

| Name | Password | Department | Role | Status |
|------|----------|------------|------|--------|
| FARHAN | farhan123 | Security | employee | active |

Then adds their shift to the `Schedule` tab:

| Name | Shift Start | Shift End | Days | Effective From | Effective Until | Order |
|------|-------------|-----------|------|----------------|-----------------|-------|
| FARHAN | 10:00 AM | 7:00 PM | Mon,Tue,Wed,Thu,Fri | 2026-02-15 | | 4 |

Within 5 minutes, FARHAN appears on the relay track and can log in.

### Example: Changing Shift Timings

The MD simply edits the `Shift Start` and `Shift End` columns. The app updates automatically.

---

## Backend Server Endpoints

The Node.js server (`server.cjs` on port 3001) will serve these APIs:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/state` | Current real-time state (who's logged in, pause info) |
| `GET` | `/api/employees` | List of all active employees with their shifts |
| `GET` | `/api/schedule` | Today's relay order and shift timings |
| `POST` | `/api/login` | Validate credentials & register login |
| `POST` | `/api/logout` | Unregister & save pause state |
| `POST` | `/api/sync` | Force re-sync from Google Sheet (master only) |

### Example: `GET /api/employees` Response

```json
{
  "employees": [
    { "name": "SUHAIL", "department": "Operations", "shift": "9:00 AM – 6:00 PM", "order": 1 },
    { "name": "AZEEZ", "department": "Operations", "shift": "6:00 PM – 2:00 AM", "order": 2 },
    { "name": "IQBAL", "department": "Operations", "shift": "2:00 AM – 9:00 AM", "order": 3 },
    { "name": "FARHAN", "department": "Security", "shift": "10:00 AM – 7:00 PM", "order": 4 }
  ],
  "lastSyncedAt": "2026-02-13T18:45:00Z"
}
```

### Example: `GET /api/schedule` Response

```json
{
  "relay": [
    { "name": "SUHAIL", "start": "09:00", "end": "18:00", "order": 1 },
    { "name": "AZEEZ", "start": "18:00", "end": "02:00", "order": 2 },
    { "name": "IQBAL", "start": "02:00", "end": "09:00", "order": 3 }
  ],
  "date": "2026-02-13",
  "totalEmployees": 4
}
```

---

## Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "Shift Relay"
3. Enable the **Google Sheets API**
4. Create a **Service Account** (Settings → IAM & Admin → Service Accounts)
5. Download the **JSON key file** → save as `credentials.json` in the project root
6. Copy the service account email (looks like `shift-relay@project-id.iam.gserviceaccount.com`)

### Step 2: Set Up the Google Sheet

1. Create a new Google Sheet
2. Add the tabs: `Employees`, `Schedule`, `Settings`
3. Fill in the column headers as shown above
4. **Share the sheet** with the service account email (give **Viewer** access)
5. Copy the **Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/`**`SHEET_ID_HERE`**`/edit`

### Step 3: Configure the Server

Create a `.env` file in the project root:

```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CREDENTIALS_PATH=./credentials.json
SYNC_INTERVAL_MINUTES=5
PORT=3001
```

### Step 4: Install Dependencies

```bash
npm install googleapis dotenv
```

### Step 5: Update the Server

Expand `server.cjs` to:
- Read from Google Sheets on startup
- Re-sync every 5 minutes
- Validate login credentials against sheet data
- Serve employee list and schedule via API

### Step 6: Update the Frontend

- Remove hardcoded employee arrays from all components
- Fetch `/api/employees` and `/api/schedule` on app load
- Make the relay track render dynamically (N employees)
- Login page sends credentials to `/api/login` for server-side validation

---

## Security Notes

- **Passwords in sheets**: For a basic internal tool this is fine. For production, consider hashing passwords and storing only hashes.
- **Service account key**: Never commit `credentials.json` to git. Add it to `.gitignore`.
- **Sheet permissions**: Give the service account **read-only** access. The MD edits directly; the app only reads.
- **HTTPS**: When deploying, use HTTPS for all API calls.

---

## For the MD

**What you need to do:**
1. Open the Google Sheet link (I'll share it with you)
2. Add employees to the `Employees` tab
3. Set their shift times in the `Schedule` tab
4. The app will pick up your changes within 5 minutes
5. To force an immediate update, click "Sync Now" on the Master Dashboard

**What you DON'T need to do:**
- No coding
- No server restarts
- No contacting the developer for routine changes
- No app updates

---

## Timeline

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Google Cloud setup + Sheet structure | 30 min |
| 2 | Backend: Google Sheets integration | 2–3 hours |
| 3 | Backend: Dynamic login & schedule APIs | 1–2 hours |
| 4 | Frontend: Remove hardcoded data, fetch from API | 2–3 hours |
| 5 | Frontend: Dynamic track for N employees | 1–2 hours |
| 6 | Testing & polish | 1–2 hours |
| **Total** | | **~8–12 hours** |
