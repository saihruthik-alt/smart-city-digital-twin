/**
 * Hyderabad Smart City Digital Twin - GIS Map Module
 * Designed & Developed by Kondra Sai Hruthik
 */

(function() {
    // Map coordinates dictionary for key locations in Hyderabad
    const locations = {
        "Hitech City": [17.4483, 78.3741],
        "Gachibowli": [17.4401, 78.3489],
        "Gachibowli Junction": [17.4401, 78.3489],
        "Jubilee Hills": [17.4325, 78.4071],
        "Jubilee Hills Road No. 36": [17.4325, 78.4071],
        "Begumpet": [17.4448, 78.4600],
        "Begumpet Flyover Area": [17.4448, 78.4600],
        "Secunderabad": [17.4399, 78.5020],
        "Secunderabad Railway Stn": [17.4399, 78.5020],
        "Charminar": [17.3616, 78.4747],
        "Charminar Bazaar Area": [17.3616, 78.4747],
        "Hussain Sagar": [17.4239, 78.4738]
    };

    let map;
    
    // Layer Groups
    const trafficLayer = L.layerGroup();
    const aqiLayer = L.layerGroup();
    const cctvLayer = L.layerGroup();
    const droneLayer = L.layerGroup();
    const safetyLayer = L.layerGroup();
    const gridLayer = L.layerGroup();

    // Drones active positions & path loops
    const dronePaths = {
        alpha: {
            center: locations["Hussain Sagar"],
            radius: 0.008, // angular radius
            angle: 0,
            speed: 0.05, // rads per tick
            marker: null
        },
        beta: {
            coords: [
                locations["Gachibowli"],
                locations["Hitech City"],
                locations["Jubilee Hills"]
            ],
            currentIdx: 0,
            ratio: 0,
            speed: 0.02,
            marker: null
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        initGISMap();
    });

    function initGISMap() {
        // Initialize map centered on Hyderabad
        map = L.map('leaflet-map', {
            zoomControl: false,
            attributionControl: false
        }).setView([17.4150, 78.4350], 12);
        
        window.cityMap = map; // expose to window for tab switching layout reflow

        // Dark theme tile layer - CartoDB Dark Matter (Free, no token required)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        // Add standard Attribution/Zoom inside safe spots
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Render GIS layers
        drawTrafficLines();
        drawAQICircles();
        drawCCTVMarkers();
        drawUtilityGrids();
        drawSafetyHeatpoints();
        initDroneSimulators();

        // Default Active Layers on launch
        map.addLayer(trafficLayer);
        map.addLayer(aqiLayer);
        map.addLayer(droneLayer);

        // Bind Layer toggle buttons
        setupMapToggles();
    }

    // Traffic congestion overlay
    function drawTrafficLines() {
        // Hitech City -> Gachibowli corridor
        L.polyline([locations["Hitech City"], locations["Gachibowli"]], {
            color: '#ef4444', weight: 5, opacity: 0.85
        }).bindPopup("<b>Hitech-Gachibowli Corridor</b><br>Congestion: High (12 km/h average speed)").addTo(trafficLayer);

        // Jubilee Hills No. 36
        L.polyline([locations["Jubilee Hills"], locations["Begumpet"]], {
            color: '#f59e0b', weight: 4.5, opacity: 0.8
        }).bindPopup("<b>Jubilee Hills - Begumpet Avenue</b><br>Congestion: Moderate (28 km/h)").addTo(trafficLayer);

        // ORR / Gachibowli outer lines
        L.polyline([[17.4401, 78.3489], [17.4100, 78.3200]], {
            color: '#10b981', weight: 6, opacity: 0.8
        }).bindPopup("<b>Outer Ring Road (West)</b><br>Traffic Flow: Optimal (65 km/h)").addTo(trafficLayer);
        
        // Secunderabad exit road
        L.polyline([locations["Secunderabad"], [17.4600, 78.4900]], {
            color: '#ef4444', weight: 5, opacity: 0.85
        }).bindPopup("<b>Secunderabad Stn Approach</b><br>Traffic Flow: Heavy bottlenecking (14 km/h)").addTo(trafficLayer);
    }

    // AQI Heatmap circles
    function drawAQICircles() {
        const circlesData = [
            { center: locations["Jubilee Hills"], radius: 1000, val: 54, color: '#10b981', desc: "Good" },
            { center: locations["Secunderabad"], radius: 1200, val: 118, color: '#ef4444', desc: "Unhealthy" },
            { center: locations["Gachibowli"], radius: 1100, val: 62, color: '#10b981', desc: "Satisfactory" },
            { center: locations["Charminar"], radius: 1400, val: 135, color: '#ef4444', desc: "Poor / Dust" },
            { center: locations["Begumpet"], radius: 1300, val: 88, color: '#f59e0b', desc: "Moderate" }
        ];

        circlesData.forEach(c => {
            L.circle(c.center, {
                color: c.color,
                fillColor: c.color,
                fillOpacity: 0.25,
                radius: c.radius
            }).bindPopup(`<b>AQI Station: ${c.desc}</b><br>PM2.5 Index: ${c.val}`).addTo(aqiLayer);
        });
    }

    // CCTV Nodes
    function drawCCTVMarkers() {
        const cameraIcon = L.divIcon({
            html: '<div style="background: var(--cctv-color); width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px var(--cctv-color);"></div>',
            className: 'cctv-div-icon',
            iconSize: [10, 10]
        });

        const cams = [
            { name: "Camera #01: Hitech City Flyover Node", coords: locations["Hitech City"] },
            { name: "Camera #02: Secunderabad Station Exit", coords: locations["Secunderabad"] },
            { name: "Camera #03: Charminar Bazaar Lane", coords: locations["Charminar"] },
            { name: "Camera #04: Gachibowli Ring Road", coords: locations["Gachibowli"] }
        ];

        cams.forEach(cam => {
            L.marker(cam.coords, { icon: cameraIcon })
                .bindPopup(`<b>CCTV Feed</b><br>${cam.name}<br><a href="#safety" onclick="document.querySelector('[data-tab=safety]').click(); return false;">Open Live Stream</a>`)
                .addTo(cctvLayer);
        });
    }

    // Utility smart grids
    function drawUtilityGrids() {
        // High voltage transmission lines mock representation
        const electricityGrid = [
            locations["Gachibowli"],
            locations["Hitech City"],
            locations["Jubilee Hills"],
            locations["Begumpet"]
        ];

        L.polyline(electricityGrid, {
            color: '#00f2fe', weight: 3, dashArray: '5, 10', opacity: 0.75
        }).bindPopup("<b>HV Electric Grid Ring #1</b><br>Load: 1,482 MW (Normal)").addTo(gridLayer);

        // Water distribution trunks
        const waterTrunk = [
            [17.3800, 78.3000], // Osman Sagar region
            locations["Gachibowli"],
            locations["Jubilee Hills"],
            locations["Charminar"]
        ];

        L.polyline(waterTrunk, {
            color: '#3b82f6', weight: 4.5, opacity: 0.7
        }).bindPopup("<b>Main Water Supply Line A</b><br>Flow rate: 21,200 L/sec").addTo(gridLayer);
    }

    // Safety incident Heatpoints
    function drawSafetyHeatpoints() {
        const warningIcon = L.divIcon({
            html: '<div style="background: var(--danger); width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; font-weight: 700; box-shadow: 0 0 10px var(--danger);">!</div>',
            className: 'warning-div-icon',
            iconSize: [12, 12]
        });

        L.marker([17.4452, 78.4610], { icon: warningIcon })
            .bindPopup("<b>Incident Alert SEC-491</b><br>Erratic Speed Violation<br>Status: Dispatching")
            .addTo(safetyLayer);

        L.marker([17.3622, 78.4750], { icon: warningIcon })
            .bindPopup("<b>Crowd Aggregation Warning SEC-490</b><br>Plaza Count > 50<br>Status: Monitoring")
            .addTo(safetyLayer);
    }

    // Drone Simulator on paths
    function initDroneSimulators() {
        const droneIcon = L.divIcon({
            html: '<div style="color: var(--drone-color); font-size: 16px; animation: floatAnim 1.5s infinite ease-in-out;"><i class="fa-solid fa-helicopter"></i></div>',
            className: 'drone-div-icon',
            iconSize: [16, 16]
        });

        // Initialize Drone Alpha (circular flight around Hussain Sagar)
        dronePaths.alpha.marker = L.marker(locations["Hussain Sagar"], { icon: droneIcon })
            .bindPopup("<b>Patrol Drone Alpha</b><br>Status: Surveillance Loop<br>Battery: 82%")
            .addTo(droneLayer);

        // Initialize Drone Beta (path travel Hitech -> Gachibowli -> Jubilee)
        dronePaths.beta.marker = L.marker(locations["Gachibowli"], { icon: droneIcon })
            .bindPopup("<b>Patrol Drone Beta</b><br>Status: Navigating Coordinates<br>Battery: 91%")
            .addTo(droneLayer);

        // Animated ticks
        setInterval(() => {
            tickDroneAlpha();
            tickDroneBeta();
        }, 100);
    }

    function tickDroneAlpha() {
        const p = dronePaths.alpha;
        p.angle += p.speed;
        
        const newLat = p.center[0] + Math.sin(p.angle) * p.radius;
        const newLng = p.center[1] + Math.cos(p.angle) * p.radius;
        
        p.marker.setLatLng([newLat, newLng]);
    }

    function tickDroneBeta() {
        const p = dronePaths.beta;
        p.ratio += p.speed;
        
        if (p.ratio >= 1) {
            p.ratio = 0;
            p.currentIdx = (p.currentIdx + 1) % p.coords.length;
        }

        const start = p.coords[p.currentIdx];
        const end = p.coords[(p.currentIdx + 1) % p.coords.length];

        const nextLat = start[0] + (end[0] - start[0]) * p.ratio;
        const nextLng = start[1] + (end[1] - start[1]) * p.ratio;

        p.marker.setLatLng([nextLat, nextLng]);
    }

    // Toggle Button Bindings mapping to Leaflet layers
    function setupMapToggles() {
        const configs = [
            { btnId: 'toggle-traffic', layer: trafficLayer },
            { btnId: 'toggle-aqi', layer: aqiLayer },
            { btnId: 'toggle-cctv', layer: cctvLayer },
            { btnId: 'toggle-drones', layer: droneLayer },
            { btnId: 'toggle-crime', layer: safetyLayer },
            { btnId: 'toggle-utilities', layer: gridLayer }
        ];

        configs.forEach(cfg => {
            const btn = document.getElementById(cfg.btnId);
            if (!btn) return;

            btn.addEventListener('click', () => {
                const isActive = btn.classList.toggle('active');
                if (isActive) {
                    map.addLayer(cfg.layer);
                } else {
                    map.removeLayer(cfg.layer);
                }
            });
        });
    }

    // Exposed interface: Add public complaints directly to GIS map
    window.addComplaintToMap = function(neighborhood, category) {
        const coords = locations[neighborhood] || [17.4000, 78.4500];
        
        const complaintIcon = L.divIcon({
            html: '<div style="background: var(--accent); color: #000; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border: 1.5px solid #fff; box-shadow: 0 0 12px var(--accent);">?</div>',
            className: 'complaint-div-icon',
            iconSize: [14, 14]
        });

        const m = L.marker(coords, { icon: complaintIcon })
            .bindPopup(`<b>New Complaint Registered</b><br>Sector: ${category}<br>Location: ${neighborhood}<br>Status: Pending`)
            .addTo(map);
            
        m.openPopup();
        map.setView(coords, 13);
    };

    // Crisis simulation triggers on map
    window.triggerMapTrafficCrisis = function() {
        // Highlight Hitech City flyover zone
        const warningIcon = L.divIcon({
            html: '<div style="background: var(--danger); width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; font-weight: 700; box-shadow: 0 0 15px var(--danger); animation: beaconPulse 1s infinite linear;">!</div>',
            className: 'warning-div-icon-crisis',
            iconSize: [16, 16]
        });

        const crisisMarker = L.marker(locations["Hitech City"], { icon: warningIcon })
            .bindPopup("<b>TRAFFIC GRIDLOCK EVENT</b><br>Node: Hitech Junction Flyover<br>Estimated Delay: 42 minutes")
            .addTo(map);

        map.setView(locations["Hitech City"], 14);
        crisisMarker.openPopup();
    };

})();
