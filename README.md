<div align="center">

  <h1>🌧️ RTRWH & AR Assessment Platform</h1>
  <h3>Rooftop Rainwater Harvesting & Artificial Recharge Evaluation Engine</h3>

  <p>
    An intelligent, data-driven web application to evaluate rooftop rainwater harvesting potential, calculate household demand coverage, determine artificial recharge feasibility, and generate automated technical reports.
  </p>

  <p>
    <a href="#-key-features"><strong>Explore Features »</strong></a>
    &nbsp;•&nbsp;
    <a href="#-getting-started"><strong>Quick Start »</strong></a>
    &nbsp;•&nbsp;
    <a href="#-calculation-methodology"><strong>View Formulas »</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap 5" />
    <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  </p>

</div>

---

> [!NOTE]
> **RTRWH & AR Assessment Platform** is designed for homeowners, civil engineers, hydrogeologists, and urban planners to quantitatively analyze rainwater harvesting feasibility and groundwater recharge potential without requiring complex desktop GIS software.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Calculation Methodology](#-calculation-methodology)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
- [User Guide & Workflow](#-user-guide--workflow)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌊 Overview

Rapid urbanization and depleting water tables demand efficient rainwater conservation. This platform acts as an interactive evaluation engine that computes:

- 💧 **Annual Harvest Potential** — Volume of rainfall collectible based on rooftop area, material runoff coefficient, and catchment efficiency.
- 🚰 **Demand Coverage Ratio** — Percentage of annual household water requirements satisfied by rainwater.
- 🛢️ **Optimal Storage Sizing** — Recommended capacity for rainwater storage tanks (including 20-day dry period buffer).
- 🧱 **Recharge Structure Sizing** — Sizing parameters for Artificial Recharge Pits, Shafts, and Trenches based on soil infiltration capacity.
- 💰 **Financial Impact** — Estimated annual cost savings based on local municipal water tariffs.
- ⭐ **Composite Suitability Index** — Weighted score (0–100%) indicating overall project viability.

---

## ✨ Key Features

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🧙‍♂️ Interactive Multi-Step Wizard</h3>
      <ul>
        <li><strong>Step 1: Climate & Location</strong> — Annual rainfall & regional aquifer profile.</li>
        <li><strong>Step 2: Catchment & Demand</strong> — Rooftop area, material (RCC, Tile, Metal, Asphalt, Grass), condition, & family consumption.</li>
        <li><strong>Step 3: Hydrogeology & Soil</strong> — Depth to groundwater table & soil permeability rates.</li>
        <li><strong>Step 4: Summary & Audit</strong> — Input verification before final computation.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📊 Real-Time Analytics & Charts</h3>
      <ul>
        <li><strong>Monthly Rainfall Distribution</strong> — Bar chart comparing precipitation vs. harvestable yield.</li>
        <li><strong>Supply vs. Demand Analysis</strong> — Doughnut chart detailing water coverage percentage.</li>
        <li><strong>Soil Intake Feasibility</strong> — Visual gauge breakdown of soil filtration capability.</li>
        <li><strong>Dynamic Metric Counter</strong> — Animated numeric stats upon calculation.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>💡 Smart Technical Recommendations</h3>
      <ul>
        <li>Automated selection of <strong>First-Flush Diverters</strong> and sand/gravel filter units.</li>
        <li>Custom sizing calculations for <strong>Recharge Pits</strong> & <strong>Injection Wells</strong>.</li>
        <li>Seasonal operation & preventive maintenance schedules.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📄 Exportable PDF Reports & UI/UX</h3>
      <ul>
        <li><strong>One-Click PDF Export</strong> — Print-ready summary report.</li>
        <li><strong>Dark / Light Mode Toggle</strong> — User preference saved in <code>localStorage</code>.</li>
        <li><strong>Fully Responsive Layout</strong> — Seamless across mobile, tablet, and desktop.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🧮 Calculation Methodology

The calculations follow hydrological engineering standard principles:

### 1️⃣ Annual Harvesting Potential ($V$)
$$V = R \times A \times C \times C_f \times \eta$$

| Variable | Description | Default / Values |
| :--- | :--- | :--- |
| $R$ | Annual Rainfall ($\text{mm}$) | User Input (e.g., 800 mm) |
| $A$ | Rooftop Catchment Area ($\text{m}^2$) | User Input (e.g., 100 $\text{m}^2$) |
| $C$ | Runoff Coefficient | Metal ($0.90$), RCC ($0.85$), Tile ($0.80$), Grass ($0.30$) |
| $C_f$ | Catchment Condition Factor | Excellent ($1.00$), Good ($0.90$), Fair ($0.75$), Poor ($0.55$) |
| $\eta$ | System Efficiency | Standard Collection Efficiency ($0.85$) |

---

### 2️⃣ Household Water Demand & Coverage Ratio
$$D = N \times q \times 365$$
$$\text{Coverage Rate (\%)} = \min\left(100\%, \frac{V}{D} \times 100\right)$$

- **$N$**: Number of occupants
- **$q$**: Daily per capita consumption ($\text{L/person/day}$)

---

### 3️⃣ Recommended Tank Capacity ($V_{\text{tank}}$) & Recharge Sizing ($V_{\text{pit}}$)
$$V_{\text{tank}} = N \times q \times 20 \quad \text{(Liters)}$$
$$V_{\text{pit}} = A \times \left(\frac{R \times 0.10}{1000}\right) \quad \text{(m}^3\text{)}$$

---

### 4️⃣ Suitability Score Index (0–100%)
$$S = (W_R \cdot S_R) + (W_A \cdot S_A) + (W_S \cdot S_S) + (W_D \cdot S_D) + (W_G \cdot S_G)$$

> [!TIP]
> The composite score balances 5 weighted metrics: Rainfall Adequacy (30%), Roof Area (20%), Soil Permeability (20%), Demand Coverage (20%), and Water Table Depth (10%).

---

## 🛠️ Tech Stack & Architecture

- **Core Markup & Styling**: HTML5, CSS3 (Custom CSS Properties, CSS Grid, Flexbox, Keyframe Animations)
- **UI Framework**: [Bootstrap 5.3.2](https://getbootstrap.com/)
- **Data Visualization**: [Chart.js 4.4.0](https://www.chartjs.org/)
- **Icons & Typography**: [Font Awesome 6.5.0](https://fontawesome.com/), Google Fonts (`Inter` & `Poppins`)
- **Scripting**: Vanilla JS (ES6+ Modules, DOM Manipulation, LocalStorage, Event Observers)

---

## 📁 Directory Structure

```
├── 📄 index.html      # Primary application structure & multi-step modal forms
├── 🎨 style.css       # Main stylesheet, CSS variable themes, & responsive design
├── ⚙️ script.js       # Core logic: form wizard, calculation engine, & Chart.js instances
└── 📖 README.md       # Project documentation
```

---

## 🚀 Getting Started

> [!IMPORTANT]
> No Node.js environment, build step, or backend installation required.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/rtrwh-ar-assessment.git
cd rtrwh-ar-assessment
```

### 2️⃣ Run the App
- **Option A (Direct)**: Double-click `index.html` to open directly in any modern browser.
- **Option B (Local Dev Server)**:
  ```bash
  npx serve .
  ```
  Then open `http://localhost:3000` in your web browser.

---

## 📖 User Guide & Workflow

```mermaid
flowchart LR
    A[Start Assessment] --> B[Step 1: Location & Climate]
    B --> C[Step 2: Rooftop & Household Demand]
    C --> D[Step 3: Groundwater & Soil Type]
    D --> E[Step 4: Review Summary]
    E --> F[Calculate Assessment]
    F --> G[View Analytics & Charts]
    G --> H[Export PDF Report]
```

1. Click **"Start Assessment"** on the hero section.
2. Step through the input forms providing local rainfall, roof area, material, household size, groundwater depth, and soil type.
3. Review your entered parameters in **Step 4** and submit.
4. Explore interactive charts, custom system recommendations, financial savings, and click **"Print / Download Full Report"** for offline access.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve calculations, add localized rainfall datasets, or enhance the UI:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/CoolFeature`).
3. Commit your Changes (`git commit -m 'Add some CoolFeature'`).
4. Push to the Branch (`git push origin feature/CoolFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

<div align="center">
  <br />
  <sub>Built with ❤️ for Sustainable Water Resource Management & Groundwater Conservation</sub>
</div>