<div style="display: flex; flex-direction: row; align-items: left;">
  <img src="https://github.com/user-attachments/assets/13f974b8-1848-4b73-adf8-0c8a9c2d9a7c" width="80px" alt="logo" style="margin-right: 10px;">
  <h1>AgriMind AI</h1>
</div>
A comprehensive, AI-powered farm management dashboard to help agricultural professionals manage fields, resources, sustainability, livestock, and reporting—all in one place.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.0.0-61dafb.svg)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
  - [Core Functionality](#core-functionality)
  - [Advanced & Smart Features](#advanced--smart-features)
  - [Analytics](#ai--analytics)
  - [Integrations](#integrations)
  - [Recent Additions](#recent-additions)
- [🚀 Getting Started](#-getting-started)
- [🛠️ Technical Details](#-technical-stack)
- [🔧 Development](#-development)
- [🗺️ Future Roadmap](#-future-roadmap)
- [📄 License](#-license)
- [🔗 References](#-references)

---

## 🎯 Overview

AgriMind AI lets you:
- Optimize farm operations with data-driven insights
- Track sustainability and efficiency metrics (water, carbon, fertilizer, pesticides, labor, and more)
- Plan, record, and analyze all aspects of farm management
- Harness AI for forecasting, recommendations, and compliance

---

## ✨ Features

### Core Functionality

- **Dashboard Overview**
  - Quick Actions for water, fertilizer, and harvest logging
  - Sustainability scores, 10-day weather, active issues, task manager, upcoming activities

- **Field & Farm Management**
  - Add/edit/delete farms with details
  - Track crop rotations and farm history
  - Harvest and fertilizer record management

- **Water Management**
  - Record and analyze water usage
  - Water efficiency scores and irrigation tracking
  - Historical graphs and quick-add actions

- **Crop Planning**
  - Rotation scheduling
  - Calendar and event planning
  - Crop plan visualizations

- **Task & Issue Tracking**
  - Priority, due dates, and status
  - View, manage, and resolve farm issues

- **Livestock Tracking**
  - Add, edit, and monitor livestock inventory and health

- **Soil Health Tracking**
  - Monitor pH, organic matter, nitrogen, phosphorus, potassium, and moisture
  - Visual soil quality/radar charts

- **Reporting & History**
  - Detailed logs for all resources and activities
  - Export reports for compliance and analysis

- **Settings & Help**
  - Personalize app settings
  - In-app instructions and interactive walkthrough

---

### Advanced & Smart Features

- **Sustainability & Compliance**
  - Water and carbon footprint tracking
  - Pesticide usage with compliance alerts
  - Organic practices assessment

- **Weather Integration**
  - Real-time 10-day weather forecast (Open-Meteo API)
  - Weather-based planning and irrigation optimization

- **Efficiency Analytics**
  - Labor, energy, and resource efficiency dashboards
  - Identify bottlenecks and streamline operations

---

### Analytics

- **Personalized Recommendations**
  - Resource usage optimization
  - Predictive insights for sustainability and productivity
- **Automated Alerts**
  - Overuse, inefficiency, and compliance notifications

---

### Integrations

- **API Integrations**
  - Weather data integration (live)
  - Ready for cloud storage and external data sources, Django Backend with Postgres SQL database

---

### Recent Additions

- Livestock management dashboard
- Side navigation for quick feature access
- Refactored data/API service for modularity and future backend integration
- Django backend for server-side features
- Enhanced soil health and pesticide tracking modules

For full commit history and the latest changes, see:  
[GitHub Commits](https://github.com/AMEND09/farmerapp/commits?per_page=20&sort=updated)

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/AMEND09/farmerapp.git
   cd farmerapp
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npm run dev
   ```
4. **Build for production**
   ```bash
   npm run build
   ```

**Try it online:**  
[AgriMind AI Web App](https://amend09.github.io/farmerapp/)

---

## 🛠️ Technical Stack

- **Frontend:** React 18 + TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts
- **State/Data:** React Hooks, data storage abstraction, Open-Meteo API
- **Testing/Dev:** Vite, Jest, GitHub Pages
- **Backend:** Python (Django - early support, expanding soon)

---

## 🔧 Development

The frontend source code is primarily located in the `src/` directory:
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
The Django backend code is in the `backend/backend/` directory. For more details on the overall file structure, refer to [DOCUMENTATION.md](DOCUMENTATION.md).

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
