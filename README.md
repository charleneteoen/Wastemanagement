# ♻️ Waste Management Optimization Dashboard
<p align="center">
  <img src="https://github.com/user-attachments/assets/c666f694-260d-45c8-bf00-77f2e5718a5c" alt="Bin Chilling" width="300" />
</p>

This project is a simulation-based dashboard designed to help facilities managers optimize waste collection processes in mixed-use environments. It provides data-driven insights into cost efficiency, bin usage, and actionable recommendations to reduce ad-hoc collection and improve site cleanliness.

---

## 🚀 Getting Started

Follow these steps to set up the project locally for development and testing.

### 1. Clone the Repository

```bash
git clone https://github.com/charleneteoen/Wastemanagement.git
cd Wastemanagement
```
### 2. Install Dependencies and Start the Development Server
```
npm install --legacy-peer-deps
npm run dev
Visit http://localhost:3000 in your browser to access the dashboard.
```

## 🗂️ Project Structure

```text
WASTE-MANAGEMENT-DASHBOARD-2/
├── app/
│   ├── excel-template/          # Excel export templates
│   ├── tenant-inputs/           # Input configs for tenants
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # App layout (Next.js)
│   ├── page.tsx                 # Main dashboard logic
│   ├── simulation.js            # Simulation logic (JavaScript)
│   └── run_simulation.ts        # Entry point to run simulation
├── components/                  # UI components (charts, buttons, inputs)
├── hooks/                       # React custom hooks
├── lib/                         # Utility functions
├── public/                      # Static assets (images/icons)
├── services/                    # Data services and chart logic
├── styles/                      # Custom styling
├── simulation_output.json       # Saved simulation result (example)
├── simulation_results.json      # Simulation result dataset
├── tailwind.config.ts           # TailwindCSS configuration
├── tsconfig.json                # TypeScript config
├── next.config.mjs              # Next.js build configuration
└── package.json                 # Project dependencies and scripts
```

### Features
```text
💡 Recommendations: Recommendations to optimize bin count and collection schedules.
📈 Simulation Insights: Visualizes simulated waste trends across a 12-month period.
📉 Cost Breakdown: Compares regular vs. ad-hoc collection costs.
```


### 📄 License

This project is licensed under the MIT License. See the LICENSE file for more details.
