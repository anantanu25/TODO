# TaskFlow — Modern & Responsive TODO List Web Application

TaskFlow is a modern, responsive, dashboard-style **TODO List Web Application** built with **React**, styled with clean **CSS**, and integrated with **Supabase (PostgreSQL)** for reliable cloud data persistence.

---

## ✨ Features

### 1. Complete CRUD Operations
- **Create:** Add new tasks with title, description, due date, and priority (`Low`, `Medium`, `High`).
- **Read:** Organized task cards displaying title, description, priority badge, due date with overdue warnings, and status pills.
- **Update:** Edit task details anytime, and toggle status between `Pending` and `Completed` with a single click.
- **Delete:** Safe deletion workflow with a confirmation dialog to prevent accidental removal.

### 2. Dashboard & Organization
- **Productivity Dashboard:** Real-time counters for **Total Tasks**, **Pending Tasks**, **Completed Tasks**, and **High Priority Tasks**.
- **Dynamic Progress Bar:** Visual completion percentage indicator reflecting overall productivity.
- **Instant Search:** Search tasks in real-time across both titles and descriptions.
- **Filter Tabs:** Quickly filter tasks by `All`, `Pending`, or `Completed`.
- **Priority Filter:** Filter by `High`, `Medium`, or `Low` priority.
- **Multi-criteria Sorting:** Sort by `Newest First`, `Oldest First`, `Due Date (Earliest)`, `Due Date (Latest)`, or `Priority (High to Low)`.
- **Empty & Filter States:** Helpful state messages and call-to-actions when there are no tasks or no search matches.

### 3. Responsive & User-Friendly UI
- **Priority Color Coding:**
  - 🔴 **High Priority:** Rose/Red accent and border
  - 🟡 **Medium Priority:** Warm Amber accent and border
  - 🟢 **Low Priority:** Emerald Green accent and border
- **Mobile, Tablet & Desktop Responsive:** Fluid layouts, flexbox, grid, and touch-friendly targets.
- **Toast Notifications:** Instant feedback on task creation, edits, deletion, and status changes.
- **Smart Connection System:** Seamlessly works out-of-the-box in local storage mode and allows one-click connection to a live Supabase database either via `.env` or in-app settings modal.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (Vite)
- **Icons:** Lucide React
- **Styling:** Modern CSS (CSS custom properties, glassmorphism, responsive media queries)
- **Backend / Database:** Supabase (Cloud PostgreSQL) with Row-Level Security (RLS)

---

## 📂 Project Structure

```
├── .env                    # Environment variables (Supabase URL & Anon Key)
├── .env.example            # Example environment file
├── index.html              # HTML entry point with Plus Jakarta Sans font
├── package.json            # Project dependencies & scripts
├── supabase-schema.sql     # Database creation script & RLS policies
├── vite.config.js          # Vite configuration
└── src/
    ├── main.jsx            # React root DOM rendering
    ├── App.jsx             # Main application state and CRUD orchestration
    ├── index.css           # Design system, layout, components, and responsive CSS
    ├── lib/
    │   └── supabase.js     # Supabase client initializer and local fallback
    ├── services/
    │   └── taskService.js  # CRUD operations (fetch, create, update, delete, metrics)
    └── components/
        ├── Header.jsx           # App branding, connection pill, and "New Task" button
        ├── StatsDashboard.jsx   # Metric cards and overall completion progress bar
        ├── FilterBar.jsx        # Search bar, status tabs, priority filter, sort menu
        ├── TaskList.jsx         # Task grid, skeleton loader, and empty state
        ├── TaskCard.jsx         # Card with checkbox toggle, priority badge, edit/delete
        ├── TaskModal.jsx        # Create & edit task dialog
        ├── DeleteModal.jsx      # Confirmation modal for deleting tasks
        ├── SupabaseModal.jsx    # UI settings dialog for connecting to Supabase
        └── Toast.jsx            # Toast alert notification component
```

---

## 🚀 Quick Setup & Running Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Open your browser and navigate to the displayed local URL (typically `http://localhost:3000` or `http://localhost:5173`).

---

## 🗄️ Setting Up Supabase Database

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New project**, choose a name and database password, and select your region.

### Step 2: Run the SQL Schema
1. In your Supabase project dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New query**.
3. Open the file `supabase-schema.sql` located in this project directory, copy all its contents, paste them into the SQL Editor, and click **Run**.
4. The script creates the `tasks` table, sets up performance indexes, creates an automatic `updated_at` trigger, and configures Row Level Security (RLS) policies allowing CRUD operations.

### Step 3: Connect the App to Supabase
You can connect in either of two easy ways:

#### Option A: Using `.env` (Recommended for development)
1. In Supabase Dashboard, go to **Project Settings** &rarr; **API**.
2. Copy your **Project URL** and **anon (public)** key.
3. Open `.env` in the root of this project and set:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart your Vite development server (`npm run dev`).

#### Option B: Directly from the App UI
1. Click the **Connection Pill** in the top right of the application header (`Local Mode` or `Supabase Connected`).
2. Paste your **Project URL** and **Anon Key**.
3. Click **Test Connection** to verify database connectivity.
4. Click **Save & Apply**. The app will immediately start syncing tasks with Supabase!

---

## 🧪 Build for Production
To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

