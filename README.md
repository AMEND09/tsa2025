<div style="display: flex; flex-direction: row; align-items: left;">
  <img src="https://github.com/user-attachments/assets/13f974b8-1848-4b73-adf8-0c8a9c2d9a7c" width="80px" alt="logo" style="margin-right: 10px;">
  <h1>AgriMind AI</h1>
</div>
A comprehensive, AI-powered farm management dashboard enabling agricultural professionals to manage fields, resources, sustainability, livestock, and reporting—all in one place.

Access the frontend-only demo at https://amend09.github.io/AgriMind.ai/. The backend is not included in this demonstration.

For comprehensive technical information, consult the DOCUMENTATION.md file.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.0.0-61dafb.svg)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
  - [Core Functionality](#core-functionality)
  - [Advanced & Smart Features](#advanced--smart-features)
  - [Analytics](#analytics)
  - [Integrations](#integrations)
  - [Recent Additions](#recent-additions)
- [🚀 Getting Started](#-getting-started)
- [🛠️ Technical Stack](#-technical-stack)
- [🔧 Development](#-development)
- [🗺️ Future Roadmap](#-future-roadmap)
- [📄 License](#-license)
- [🔗 References](#-references)

---

## 🎯 Overview

AgriMind AI empowers users to:
- Optimize farm operations with data-driven insights.
- Track sustainability and efficiency metrics including water, carbon, fertilizer, pesticides, and labor.
- Plan, record, and analyze all aspects of farm management.
- Harness AI for forecasting, recommendations, and compliance.

---

## ✨ Features

### Core Functionality

- **Dashboard Overview:**
  - Provides quick actions for water, fertilizer, and harvest logging.
  - Displays sustainability scores, a 10-day weather forecast, active issues, a task manager, and upcoming activities.

- **Field & Farm Management:**
  - Facilitates adding, editing, and deleting farms with detailed information.
  - Tracks crop rotations and farm history.
  - Manages harvest and fertilizer records.

- **Water Management:**
  - Records and analyzes water usage.
  - Calculates water efficiency scores and tracks irrigation.
  - Presents historical graphs and quick-add actions for water data.

- **Crop Planning:**
  - Supports rotation scheduling.
  - Includes calendar and event planning tools.
  - Offers crop plan visualizations.

- **Task & Issue Tracking:**
  - Manages tasks with priority, due dates, and status.
  - Allows viewing, managing, and resolving farm issues.

- **Livestock Tracking:**
  - Enables adding, editing, and monitoring livestock inventory and health.

- **Soil Health Tracking:**
  - Monitors pH, organic matter, nitrogen, phosphorus, potassium, and moisture.
  - Visualizes soil quality with radar charts.

- **Reporting & History:**
  - Generates detailed logs for all resources and activities.
  - Exports reports for compliance and analysis.

- **Settings & Help:**
  - Offers personalized application settings.
  - Provides in-app instructions and an interactive walkthrough.

---

### Advanced & Smart Features

- **Sustainability & Compliance:**
  - Tracks water and carbon footprints.
  - Monitors pesticide usage with compliance alerts.
  - Assesses organic practices.

- **Weather Integration:**
  - Integrates real-time 10-day weather forecasts (Open-Meteo API).
  - Supports weather-based planning and irrigation optimization.

- **Efficiency Analytics:**
  - Delivers labor, energy, and resource efficiency dashboards.
  - Identifies bottlenecks and streamlines operations.

---

### Analytics

- **Personalized Recommendations:**
  - Generates recommendations for resource usage optimization.
  - Delivers predictive insights for sustainability and productivity.
- **Automated Alerts:**
  - Issues automated alerts for overuse, inefficiency, and compliance notifications.

---

### Integrations

- **API Integrations:**
  - Features live weather data integration via the Open-Meteo API.
  - Incorporates a Django Backend with a PostgreSQL database, supporting cloud storage and external data sources.

---

### Recent Additions

- Livestock management dashboard.
- Side navigation for quick feature access.
- Refactored data/API service for modularity and backend integration.
- Django backend for server-side features.
- Enhanced soil health and pesticide tracking modules.

For the complete commit history and the latest changes, refer to:
[GitHub Commits](https://github.com/AMEND09/AgriMind.ai/commits?per_page=20&sort=updated)

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AMEND09/AgriMind.ai.git
   cd AgriMind.ai
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```

**Access the web application:**
[AgriMind AI Web App](https://amend09.github.io/AgriMind.ai/)

---

## 🛠️ Technical Stack

For comprehensive technical information, consult the DOCUMENTATION.md file.

- **Frontend:** React 18 + TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts
- **State Management & Data:** Utilizes React Hooks, a data storage abstraction layer, and integrates the Open-Meteo API.
- **Development & Deployment:** Vite, Jest, GitHub Pages
- **Backend:** Python (Django)

---

## 🔧 Development

For comprehensive technical information, consult the DOCUMENTATION.md file.

The frontend source code resides in the `src/` directory:
```
src/
├── artifacts/         # Core application logic, types, and feature-specific components
│   ├── components/    # Custom React components for specific features (TaskManager, LoginPage, etc.)
│   ├── models/        # Data models (e.g., sustainability.ts)
│   ├── default.tsx    # Main orchestrating component
│   ├── types.ts       # Core TypeScript type definitions
│   └── utils.ts       # Utility functions (calculations, UI helpers)
├── components/        # Reusable UI components
│   ├── ui/            # shadcn/ui components (Alert, Badge, Card, Form, Tabs)
│   └── layout.tsx     # Main layout component
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and libraries (e.g., clsx, tailwind-merge)
├── pages/             # Page-level components (e.g., Home.tsx)
├── router/            # Routing configuration
├── styles/            # Styling-related files (e.g., theme.ts)
├── typings/           # Custom TypeScript type definitions
├── App.tsx            # Main application layout component
├── index.css          # Global stylesheets, Tailwind CSS setup
└── main.tsx           # Entry point of the React application
```
The Django backend code is located in the `backend/backend/` directory. For more details on the overall file structure, refer to [DOCUMENTATION.md](DOCUMENTATION.md).

---

## 🗺️ Future Roadmap

- [ ] ML-based yield predictions
- [ ] Automated irrigation control
- [ ] Mobile application

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🔗 References

- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Sustainable Agriculture Guidelines](https://saiplatform.org)
