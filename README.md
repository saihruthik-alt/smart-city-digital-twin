# Hyderabad Smart City Digital Twin

An interactive, high-fidelity GIS and telemetry simulation of Hyderabad, India, designed to serve as a digital model for municipal monitoring, analytics, and predictive planning. 

**Designed & Developed by:** Kondra Sai Hruthik

---

## 🌟 Overview

The **Hyderabad Smart City Digital Twin** dashboard is a state-of-the-art Web GIS and analytics panel that consolidates data feeds, sensor telemetry, and simulation engines into a single, unified command center. Utilizing a premium dark glassmorphism interface design, this application visualizes real-time metrics, AI-driven predictive forecasting, drone patrols, and security camera analytics across major landmarks in Hyderabad.

---

## 🛠️ Architecture & Core Modules

The application is structured into **10 core operational modules** across an interactive single-page layout:

1. **GIS Mapping Engine**: Interactive GIS map utilizing Leaflet.js centered on Hyderabad. Visualizes layer overlays for Traffic congestion, Air Quality Index (AQI), CCTV positions, live Drone patrols, Safety hotspots, and Smart Grid lines.
2. **Traffic Monitoring**: Displays 24-hour speed charts, bottlenecks list, and color-coded road segment markers. Features a "Trigger Rush Hour" simulation.
3. **Pollution & AQI**: Integrates a dynamic circular progress gauge showing city averages, regional bar charts (J Jubilee Hills, Secunderabad, Gachibowli, Charminar, Begumpet), and active sensor logs.
4. **Smart Electricity Grid**: Tracks solar farm output, load grid distribution, backup capacities, and active outage details.
5. **Water Management**: Tracks capacity levels for primary reservoirs supplying Hyderabad: Osman Sagar, Himayat Sagar, and Singur Dam. Detects pipeline leak alerts.
6. **AI Predictor (Neural Forecast)**: Parameter adjustment center (Sliders for Time of Day, Storm Rain, and Public Events) mapping variables to forecast city congestion, backup grid draw, and surface runoff rates.
7. **Drone Surveillance Telemetry**: Renders live patrolling drone markers moving in real time across mapping routes, paired with a custom radar scan screen.
8. **CCTV Analytics**: Mock live camera stream panels (Hitech Flyover, Secunderabad Exit, Charminar Lane, Gachibowli Ring) displaying bounding box overlays detecting pedestrians and vehicles, complete with confidence percentages.
9. **Weather Forecast**: Microclimate widgets reporting humidity, barometric pressure, wind speed/direction, and hourly weather strips.
10. **Public Complaint Portal**: Submit municipal grievances directly through a structured form. Submitted reports automatically place orange warning markers at respective coordinates on the Leaflet GIS map and update the status log.

---

## 📂 Project Directory Structure

```text
smart-city-digital-twin/
├── index.html        # Main dashboard structure & layouts
├── styles.css        # Custom CSS variables, glassmorphism panels, and keyframe animations
├── app.js            # Main application controller, Chart.js integrations, and AI simulators
├── map.js            # Leaflet.js map overlays, drone movement math, and interactive markers
└── README.md         # Documentation & setup instructions
```

---

## 🚀 Execution & Deployment

### Run in GitHub Codespaces (Directly on Web)
1. On your GitHub repository page, click the green **Code** button.
2. Select the **Codespaces** tab, then click **Create codespace on main**.
3. Once the Codespace environment initializes, open the VS Code Terminal.
4. Run the following command:
   ```bash
   python3 -m http.server 8000
   ```
5. Click the pop-up notification **"Open in Browser"** (or go to the **Ports** panel and click the Local Address link) to view the live dashboard.

### Local Deployment
To run the application locally on your machine:

#### Method 1: Using Python (Recommended)
1. Open your terminal.
2. Navigate to the project directory:
   ```bash
   cd "/Users/saihruthik/.gemini/antigravity/scratch/smart-city-digital-twin"
   ```
3. Start the local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and navigate to: `http://localhost:8000`

#### Method 2: Direct Execution
Simply locate the project folder and double-click the **`index.html`** file to open it directly in your web browser of choice.

---

## 🧬 Technologies Used

* **Structure**: Semantic HTML5 Markup
* **Styling**: Vanilla CSS3 Custom Properties (variables, transitions, keyframe animations)
* **Logic**: Vanilla ES6 JavaScript (LocalStorage integration, simulation loops)
* **GIS Mapping**: Leaflet.js CDN Map Engine (using CartoDB Dark Matter tile coordinates)
* **Data Visualization**: Chart.js Library
* **Iconography**: FontAwesome Icon Library
* **Fonts**: Google Fonts (Outfit & Inter)
