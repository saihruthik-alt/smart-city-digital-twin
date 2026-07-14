/**
 * Hyderabad Smart City Digital Twin - Application Logic
 * Designed & Developed by Kondra Sai Hruthik
 */

// Application state variables
let trafficChart, aqiChart, powerChart;
let currentTab = 'dashboard';

// Grievances store with mock initial records
const defaultGrievances = [
    { id: 1081, category: "Traffic", location: "Gachibowli Junction", description: "Traffic light synchronization mismatch creating Hitech flyover backups.", status: "In Progress", timestamp: "10:04 AM" },
    { id: 1082, category: "Water Usage", location: "Jubilee Hills Road No. 36", description: "Water pipeline leakage spreading across road near Metro pillar.", status: "Resolved", timestamp: "08:15 AM" },
    { id: 1083, category: "Electricity", location: "Charminar Bazaar Area", description: "Streetlight array offline on the south approach avenue.", status: "Pending", timestamp: "10:12 AM" },
    { id: 1084, category: "Pollution", location: "Secunderabad Railway Stn", description: "Construction dust hazard. Water sprays not active.", status: "Pending", timestamp: "10:17 AM" }
];

let grievances = JSON.parse(localStorage.getItem('hyd_twin_grievances')) || defaultGrievances;

// Mock traffic bottleneck records
const bottlenecks = [
    { place: "Hitech City Flyover", speed: 14, state: "Critical", icon: "fa-triangle-exclamation", color: "danger" },
    { place: "Begumpet Crossing", speed: 26, state: "Moderate", icon: "fa-circle-exclamation", color: "warning" },
    { place: "Gachibowli Outer Ring", speed: 45, state: "Clear", icon: "fa-circle-check", color: "success" },
    { place: "Secunderabad Stn Exit", speed: 18, state: "Heavy congestion", icon: "fa-triangle-exclamation", color: "danger" },
    { place: "Charminar Outer Loop", speed: 34, state: "Optimal Flow", icon: "fa-circle-check", color: "success" }
];

// Safety incidents
const incidents = [
    { id: "SEC-491", desc: "Erratic speed violation flag", location: "Begumpet Flyover", time: "10:14 AM", status: "Dispatching", color: "red" },
    { id: "SEC-490", desc: "Crowd aggregation warning (>50)", location: "Charminar Plaza", time: "09:44 AM", status: "Monitoring", color: "yellow" },
    { id: "SEC-489", desc: "Unauthorized drone in airspace", location: "Secretariat Area", time: "08:30 AM", status: "Resolved", color: "green" },
    { id: "SEC-488", desc: "Water pipeline alert", location: "Jubilee Hills No. 36", time: "08:15 AM", status: "Closed", color: "green" }
];

// Environmental log stations
const aqiLogs = [
    { station: "Jubilee Hills", pm25: 54, pm10: 82, quality: "Good", time: "10:18 AM" },
    { station: "Secunderabad Hub", pm25: 118, pm10: 174, quality: "Unhealthy for Sensitive Groups", time: "10:15 AM" },
    { station: "Gachibowli Ring", pm25: 62, pm10: 95, quality: "Satisfactory", time: "10:10 AM" },
    { station: "Charminar Bazaar", pm25: 135, pm10: 210, quality: "Poor", time: "10:05 AM" },
    { station: "Begumpet Airport", pm25: 88, pm10: 120, quality: "Moderate", time: "10:02 AM" }
];

// CCTV Cameras simulation settings
const cctvCameras = {
    'cam-01': { name: "Camera #01: Hitech City Junction", code: "CAM-01_HITECH", targets: [
        { label: "VEHICLE: 98.2%", type: "vehicle", w: "120px", h: "70px", top: "30%", left: "15%" },
        { label: "PEDESTRIAN: 91.0%", type: "pedestrian", w: "45px", h: "90px", top: "40%", left: "70%" },
        { label: "VEHICLE: 99.4%", type: "vehicle", w: "100px", h: "60px", top: "60%", left: "45%" }
    ], vehicles: 8, pedestrians: 3, alert: "Lane Obstruction Detected (Gachibowli)" },
    'cam-02': { name: "Camera #02: Secunderabad Station Exit", code: "CAM-02_SECUNDERABAD", targets: [
        { label: "PEDESTRIAN: 94.6%", type: "pedestrian", w: "40px", h: "85px", top: "35%", left: "20%" },
        { label: "PEDESTRIAN: 89.2%", type: "pedestrian", w: "42px", h: "85px", top: "38%", left: "30%" },
        { label: "VEHICLE: 97.8%", type: "vehicle", w: "130px", h: "75px", top: "50%", left: "60%" }
    ], vehicles: 12, pedestrians: 18, alert: "Heavy Pedestrian Surge" },
    'cam-03': { name: "Camera #03: Charminar Bazaar Lane", code: "CAM-03_CHARMINAR", targets: [
        { label: "PEDESTRIAN: 96.5%", type: "pedestrian", w: "38px", h: "80px", top: "40%", left: "10%" },
        { label: "PEDESTRIAN: 95.1%", type: "pedestrian", w: "40px", h: "80px", top: "42%", left: "25%" },
        { label: "PEDESTRIAN: 93.0%", type: "pedestrian", w: "38px", h: "80px", top: "45%", left: "40%" },
        { label: "PEDESTRIAN: 88.7%", type: "pedestrian", w: "42px", h: "82px", top: "38%", left: "75%" }
    ], vehicles: 2, pedestrians: 36, alert: "Market Congestion Standard" },
    'cam-04': { name: "Camera #04: Gachibowli Ring Road", code: "CAM-04_GACHIBOWLI", targets: [
        { label: "VEHICLE: 99.1%", type: "vehicle", w: "110px", h: "65px", top: "25%", left: "30%" },
        { label: "VEHICLE: 98.7%", type: "vehicle", w: "120px", h: "70px", top: "55%", left: "10%" },
        { label: "VEHICLE: 97.4%", type: "vehicle", w: "105px", h: "65px", top: "40%", left: "70%" }
    ], vehicles: 15, pedestrians: 0, alert: "Normal Traffic Flow speed 54 km/h" }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    updateTimeAndDate();
    setupNavigation();
    initStatsUpdates();
    
    // Initial Render of logs
    renderBottlenecks();
    renderSafetyLogs();
    renderAQILogs();
    renderComplaints();

    // Initial Charts Load
    initCharts();

    // Event listeners
    document.getElementById('cctv-selector').addEventListener('change', (e) => {
        switchCCTVFeed(e.target.value);
    });

    setupAISimulator();
    
    // Interval for Clock
    setInterval(updateTimeAndDate, 1000);
});

// Update Header clock and calendar date
function updateTimeAndDate() {
    const now = new Date();
    
    // Format: 10:19 AM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const timeStr = `${hours}:${minutes} ${ampm}`;
    document.getElementById('current-time').innerText = timeStr;
    
    // Format CCTV live timer
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const cctvTimeStr = `${String(now.getHours()).padStart(2, '0')}:${minutes}:${seconds}`;
    const cctvTimer = document.getElementById('cctv-timer');
    if (cctvTimer) cctvTimer.innerText = cctvTimeStr;

    // Date: July 14, 2026
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = now.toLocaleDateString('en-US', options);
}

// Navigation between views
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.page-view');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            currentTab = targetTab;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            views.forEach(view => {
                view.classList.remove('active');
                if (view.getAttribute('id') === targetTab) {
                    view.classList.add('active');
                }
            });
            
            // Set header title
            const headerTitle = document.getElementById('header-page-title');
            switch(targetTab) {
                case 'dashboard': headerTitle.innerText = "City Overview"; break;
                case 'traffic': headerTitle.innerText = "Traffic Monitor"; break;
                case 'pollution': headerTitle.innerText = "Environment & AQI"; break;
                case 'utilities': headerTitle.innerText = "Grid & Water Utilities"; break;
                case 'safety': headerTitle.innerText = "Safety & CCTV Analytics"; break;
                case 'ai-prediction': headerTitle.innerText = "AI Simulator & Drones"; break;
                case 'weather': headerTitle.innerText = "Meteorological Sensors"; break;
                case 'complaints': headerTitle.innerText = "Public Complaints"; break;
            }
            
            // Trigger maps redraw on leaflet container resize
            if (targetTab === 'dashboard' && window.cityMap) {
                setTimeout(() => {
                    window.cityMap.invalidateSize();
                }, 200);
            }
        });
    });
}

// Periodic simulator updates to represent a living twin
function initStatsUpdates() {
    setInterval(() => {
        if (currentTab !== 'dashboard') return;
        
        // Fluctuate Traffic Index
        const trafficValEl = document.getElementById('dashboard-traffic-index');
        let trafficVal = parseInt(trafficValEl.innerText);
        trafficVal += Math.floor(Math.random() * 5) - 2;
        trafficVal = Math.max(10, Math.min(95, trafficVal));
        trafficValEl.innerText = trafficVal + '%';

        // Fluctuate AQI
        const aqiValEl = document.getElementById('dashboard-aqi-value');
        let aqiVal = parseInt(aqiValEl.innerText);
        aqiVal += Math.floor(Math.random() * 3) - 1;
        aqiValEl.innerText = aqiVal + ' PM2.5';
        
        // Fluctuate electricity load
        const powerValEl = document.getElementById('dashboard-electricity-load');
        let powerVal = parseInt(powerValEl.innerText.replace(/,/g, ''));
        powerVal += Math.floor(Math.random() * 20) - 10;
        powerValEl.innerText = powerVal.toLocaleString() + ' MW';

        // Minor CCTV tracks update
        const cctvTracks = document.getElementById('cctv-tracks');
        if (cctvTracks) {
            let tracks = parseInt(cctvTracks.innerText.replace(/,/g, ''));
            tracks += Math.floor(Math.random() * 10) - 4;
            cctvTracks.innerText = tracks.toLocaleString() + ' targets';
        }

    }, 3000);
}

// Render Bottleneck list (Traffic tab)
function renderBottlenecks() {
    const list = document.getElementById('traffic-bottlenecks-list');
    if (!list) return;
    
    list.innerHTML = bottlenecks.map(item => `
        <div class="log-item info" style="border-left-color: var(--${item.color}-color);">
            <div class="log-desc">
                <span class="log-title">${item.place}</span>
                <span class="log-time">Average velocity: ${item.speed} km/h</span>
            </div>
            <span class="log-status-badge badge-${item.color === 'danger' ? 'red' : item.color === 'warning' ? 'yellow' : 'green'}">${item.state}</span>
        </div>
    `).join('');
}

// Render Safety Incident Logs
function renderSafetyLogs() {
    const list = document.getElementById('safety-log-list');
    if (!list) return;

    list.innerHTML = incidents.map(item => `
        <div class="log-item incident" style="border-left-color: var(--${item.color === 'red' ? 'danger' : item.color === 'yellow' ? 'warning' : 'success'}-color);">
            <div class="log-desc">
                <span class="log-title">${item.id}: ${item.desc}</span>
                <span class="log-time">Location: ${item.location} | Time: ${item.time}</span>
            </div>
            <span class="log-status-badge badge-${item.color}">${item.status}</span>
        </div>
    `).join('');
}

// Render Environmental logs
function renderAQILogs() {
    const list = document.getElementById('aqi-log-list');
    if (!list) return;

    list.innerHTML = aqiLogs.map(item => {
        let badgeColor = 'green';
        if (item.pm25 > 100) badgeColor = 'red';
        else if (item.pm25 > 80) badgeColor = 'yellow';
        
        return `
            <div class="log-item clear">
                <div class="log-desc">
                    <span class="log-title">${item.station} Monitoring Grid</span>
                    <span class="log-time">PM2.5: ${item.pm25} ug/m³ | PM10: ${item.pm10} ug/m³ | Updated: ${item.time}</span>
                </div>
                <span class="log-status-badge badge-${badgeColor}">${item.quality}</span>
            </div>
        `;
    }).join('');
}

// Render Grievance Logs
function renderComplaints() {
    const list = document.getElementById('complaints-list');
    if (!list) return;

    document.getElementById('complaint-count-badge').innerText = `${grievances.length} Registered`;

    list.innerHTML = grievances.map(item => {
        let badgeColor = 'blue';
        if (item.status === 'Resolved') badgeColor = 'green';
        else if (item.status === 'In Progress') badgeColor = 'yellow';
        else badgeColor = 'red';

        return `
            <div class="log-item alert" style="border-left-color: var(--accent-secondary);">
                <div class="log-desc">
                    <span class="log-title">#G-${item.id}: ${item.category} Outage</span>
                    <span class="log-time">Neighborhood: ${item.location} | Received: ${item.timestamp}</span>
                    <p style="margin-top: 5px; color: var(--text-muted); font-size: 11px;">"${item.description}"</p>
                </div>
                <span class="log-status-badge badge-${badgeColor}">${item.status}</span>
            </div>
        `;
    }).join('');
}

// Submit complaint handler
window.submitComplaint = function(event) {
    event.preventDefault();
    
    const category = document.getElementById('complaint-category').value;
    const location = document.getElementById('complaint-location').value;
    const description = document.getElementById('complaint-description').value;
    
    const newId = 1000 + grievances.length + 5;
    const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const newComplaint = {
        id: newId,
        category: category,
        location: location,
        description: description,
        status: "Pending",
        timestamp: timeNow
    };
    
    grievances.unshift(newComplaint);
    localStorage.setItem('hyd_twin_grievances', JSON.stringify(grievances));
    renderComplaints();
    
    // Add point on the map where the complaint is registered
    if (window.addComplaintToMap) {
        window.addComplaintToMap(location, category);
    }
    
    // Clear textarea
    document.getElementById('complaint-description').value = '';
    
    alert(`Public complaint registered successfully!\nIncident ID: #G-${newId}\nDispatched to municipal response team.`);
};

// Switch CCTV camera stream mockup
function switchCCTVFeed(camId) {
    const videoContainer = document.getElementById('cctv-video-container');
    if (!videoContainer) return;

    const data = cctvCameras[camId];
    if (!data) return;

    // Redraw static elements & overlays
    let html = `
        <div class="cctv-scanline"></div>
        <div class="cctv-static-grid"></div>
        <div class="cctv-overlay-info" id="cctv-metadata">
            NODE: ${data.code}<br>
            FPS: 30.00 // CODEC: H.265<br>
            RESOLUTION: 3840x2160
        </div>
        <div class="cctv-timestamp" id="cctv-timer">10:19:11</div>
    `;

    // Dynamic targets bounding boxes
    data.targets.forEach(t => {
        html += `
            <div class="cctv-bbox ${t.type}" style="width: ${t.w}; height: ${t.h}; top: ${t.top}; left: ${t.left};">
                <div class="cctv-bbox-label">${t.label}</div>
            </div>
        `;
    });

    // Randomize reticle target position
    const topRand = 20 + Math.random() * 50;
    const leftRand = 20 + Math.random() * 60;
    html += `<div class="cctv-target-reticle" style="top: ${topRand}%; left: ${leftRand}%;"></div>`;

    videoContainer.innerHTML = html;

    // Update count labels
    document.getElementById('cctv-count-vehicles').innerText = `${data.vehicles} Vehicles`;
    document.getElementById('cctv-count-pedestrians').innerText = `${data.pedestrians} Pedestrians`;
}

// ChartJS configuration
function initCharts() {
    // 1. Average Traffic Velocity Chart (Traffic Tab)
    const ctxTraffic = document.getElementById('trafficVelocityChart');
    if (ctxTraffic) {
        trafficChart = new Chart(ctxTraffic, {
            type: 'line',
            data: {
                labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                datasets: [{
                    label: 'Avg Speed (km/h)',
                    data: [45, 52, 38, 20, 28, 30, 15, 36],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                }
            }
        });
    }

    // 2. Regional PM2.5 Chart (AQI Tab)
    const ctxAqi = document.getElementById('aqiRegionsChart');
    if (ctxAqi) {
        aqiChart = new Chart(ctxAqi, {
            type: 'bar',
            data: {
                labels: ['Jubilee Hills', 'Secunderabad', 'Gachibowli', 'Charminar', 'Begumpet'],
                datasets: [{
                    label: 'AQI Index',
                    data: [54, 118, 62, 135, 88],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.65)',
                        'rgba(239, 68, 68, 0.65)',
                        'rgba(16, 185, 129, 0.65)',
                        'rgba(239, 68, 68, 0.65)',
                        'rgba(245, 158, 11, 0.65)'
                    ],
                    borderColor: [
                        '#10b981', '#ef4444', '#10b981', '#ef4444', '#f59e0b'
                    ],
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                }
            }
        });
    }

    // 3. Grid load Chart (Electricity)
    const ctxPower = document.getElementById('electricityDemandChart');
    if (ctxPower) {
        powerChart = new Chart(ctxPower, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [
                    {
                        label: 'Active Load (MW)',
                        data: [980, 840, 1150, 1482, 1520, 1610, 1100],
                        borderColor: '#00f2fe',
                        backgroundColor: 'rgba(0, 242, 254, 0.05)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Forecast Peak (MW)',
                        data: [1000, 850, 1200, 1500, 1600, 1750, 1150],
                        borderColor: '#eab308',
                        borderDash: [5, 5],
                        borderWidth: 1.5,
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                }
            }
        });
    }
}

// AI Simulation Parameters Interaction
function setupAISimulator() {
    const sliderTime = document.getElementById('sim-slider-time');
    const sliderRain = document.getElementById('sim-slider-rain');
    const sliderEvents = document.getElementById('sim-slider-events');

    if (!sliderTime || !sliderRain || !sliderEvents) return;

    const eventNames = ["None", "Active Expo", "IPL Match (Jubilee/Secunderabad Corridor)"];

    function updateSimulationValues() {
        const time = parseInt(sliderTime.value);
        const rain = parseInt(sliderRain.value);
        const eventIdx = parseInt(sliderEvents.value);

        // Update slider readouts
        document.getElementById('sim-val-time').innerText = `${String(time).padStart(2, '0')}:00 ${time === 18 || time === 9 ? '(Rush Hour)' : ''}`;
        document.getElementById('sim-val-rain').innerText = `${rain} mm ${rain > 60 ? '(Extreme Storm)' : rain > 20 ? '(Heavy)' : rain > 0 ? '(Light)' : '(Clear)'}`;
        document.getElementById('sim-val-events').innerText = eventNames[eventIdx];

        // Linear formula calculation logic
        let congestion = 20; // base congestion %
        
        // Hour factor
        if (time >= 8 && time <= 10) congestion += 35; // morning rush hour
        else if (time >= 17 && time <= 19) congestion += 45; // evening rush hour
        else if (time >= 12 && time <= 14) congestion += 15;
        
        // Rain factor
        congestion += Math.floor(rain * 0.4);
        
        // Events factor
        congestion += eventIdx * 12;
        
        congestion = Math.min(100, congestion);

        // Power calculation load
        let powerLoad = 900; // base power MW
        if (time >= 10 && time <= 17) powerLoad += 500; // office operations
        if (time >= 18 && time <= 22) powerLoad += 600; // domestic cooling/lighting peak
        
        // Rain cooling effect lowers A/C load, but grid line faults might happen
        if (rain > 40) powerLoad -= 150; 
        powerLoad += eventIdx * 80;

        // Water flow rate run-off
        const waterFlow = Math.floor(rain * 480);

        // Update forecast indicators
        const predCong = document.getElementById('pred-congestion');
        predCong.innerText = `${congestion}% ${congestion > 75 ? '(Severe gridlock)' : congestion > 45 ? '(Moderate congestion)' : '(Fluid flow)'}`;
        
        if (congestion > 75) {
            predCong.className = "metric-val text-danger";
        } else if (congestion > 45) {
            predCong.className = "metric-val text-warning";
        } else {
            predCong.className = "metric-val text-success";
        }

        document.getElementById('pred-power').innerText = `${powerLoad} MW`;
        document.getElementById('pred-water').innerText = `${waterFlow.toLocaleString()} L/sec`;
    }

    sliderTime.addEventListener('input', updateSimulationValues);
    sliderRain.addEventListener('input', updateSimulationValues);
    sliderEvents.addEventListener('input', updateSimulationValues);

    // Run once on load
    updateSimulationValues();
}

// Simulation triggers
window.simulateTrafficRush = function() {
    alert("Simulating City Rush Hour Event...\nInjecting synthetic congestion coordinates into Hitech City & Secunderabad GIS nodes.");
    
    // Change dashboard speeds
    document.getElementById('dashboard-traffic-index').innerText = "84%";
    document.getElementById('traffic-hitech').innerText = "High (8 km/h)";
    document.getElementById('traffic-begumpet').innerText = "High (12 km/h)";
    
    // Set map overlays if active
    if (window.triggerMapTrafficCrisis) {
        window.triggerMapTrafficCrisis();
    }
};

window.refreshAQIData = function() {
    alert("Polling environmental sensor network...\nConnecting to 42 GPRS sensor nodes in Hyderabad.");
    
    // Flash AQI progress circle
    const circle = document.getElementById('aqi-progress-circle');
    if (circle) {
        circle.style.strokeDashoffset = 339; // reset
        setTimeout(() => {
            circle.style.strokeDashoffset = 240; // normal
        }, 300);
    }
};

window.resetComplaints = function() {
    if (confirm("Are you sure you want to reset the complaints database back to initial defaults?")) {
        localStorage.removeItem('hyd_twin_grievances');
        grievances = [...defaultGrievances];
        renderComplaints();
        alert("Complaints database successfully reset to default.");
    }
};

