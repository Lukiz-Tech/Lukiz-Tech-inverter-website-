/* ========================================
   ESP32-C3 INVERTER MONITORING DASHBOARD
   JavaScript Application Logic
   ======================================== */

class InverterDashboard {
    constructor() {
        // System state
        this.isRunning = false;
        this.lastUpdateTime = new Date();
        this.startTime = Date.now();
        this.updateInterval = null;
        this.uptimeInterval = null;

        // Sensor data storage
        this.currentData = {
            batteryVoltage: 48.50,
            acVoltage: 230.45,
            outputPower: 2450,
            temperature: 35,
            frequency: 50.00,
            batterySoc: 85,
            inverterEfficiency: 98.2,
            inputCurrent: 51.5,
            outputCurrent: 10.8,
            powerFactor: 0.99
        };

        // Min/Max tracking
        this.minMaxData = {
            batteryVoltage: { min: 47.2, max: 50.8 },
            acVoltage: { min: 225.3, max: 234.8 },
            outputPower: { min: 1250, max: 4800 },
            temperature: { min: 28, max: 42 }
        };

        // Data history for charts
        this.dataHistory = {
            batteryVoltage: [],
            acVoltage: [],
            outputPower: [],
            temperature: []
        };

        // Initialize
        this.initializeEventListeners();
        this.startDashboard();
        this.startUptimeCounter();
    }

    /* ========================================
       INITIALIZATION
       ======================================== */

    initializeEventListeners() {
        // Listen for any control buttons if added in future
        document.addEventListener('DOMContentLoaded', () => {
            this.isRunning = true;
            this.simulateStartup();
        });
    }

    simulateStartup() {
        // Simulate system startup sequence
        console.log('🔌 ESP32-C3 Inverter Monitor Starting...');
        
        setTimeout(() => {
            this.updateStatusBadge('ONLINE');
            this.logEvent('System started successfully', 'info');
        }, 500);

        setTimeout(() => {
            this.logEvent('Battery connection established', 'success');
        }, 1000);

        setTimeout(() => {
            this.logEvent('AC grid synchronized', 'info');
        }, 1500);

        setTimeout(() => {
            this.logEvent('All sensors initialized', 'success');
            this.startDataSimulation();
        }, 2000);
    }

    /* ========================================
       DATA SIMULATION
       ======================================== */

    startDataSimulation() {
        this.updateInterval = setInterval(() => {
            this.simulateSensorData();
            this.updateAllDisplays();
        }, 2000); // Update every 2 seconds
    }

    simulateSensorData() {
        // Simulate realistic sensor data with fluctuations
        this.currentData.batteryVoltage = this.addNoise(48.50, 0.3);
        this.currentData.acVoltage = this.addNoise(230.45, 1.5);
        this.currentData.outputPower = Math.round(this.addNoise(2450, 400));
        this.currentData.temperature = Math.round(this.addNoise(35, 2));
        this.currentData.frequency = this.addNoise(50.00, 0.2);
        this.currentData.batterySoc = Math.max(20, Math.min(100, Math.round(this.addNoise(85, 3))));
        this.currentData.inverterEfficiency = Math.max(90, Math.min(99, this.addNoise(98.2, 0.5)));
        this.currentData.inputCurrent = this.addNoise(51.5, 3);
        this.currentData.outputCurrent = this.addNoise(10.8, 1.2);
        this.currentData.powerFactor = Math.max(0.90, Math.min(0.99, this.addNoise(0.99, 0.02)));

        // Update min/max values
        this.updateMinMax();

        // Store in history for charts
        this.storeDataHistory();

        this.lastUpdateTime = new Date();
    }

    addNoise(baseValue, range) {
        const noise = (Math.random() - 0.5) * range;
        return baseValue + noise;
    }

    updateMinMax() {
        const keys = Object.keys(this.minMaxData);
        keys.forEach(key => {
            const current = this.currentData[key];
            if (current < this.minMaxData[key].min) {
                this.minMaxData[key].min = current;
            }
            if (current > this.minMaxData[key].max) {
                this.minMaxData[key].max = current;
            }
        });
    }

    storeDataHistory() {
        // Keep last 10 data points
        Object.keys(this.dataHistory).forEach(key => {
            this.dataHistory[key].push(this.currentData[key]);
            if (this.dataHistory[key].length > 10) {
                this.dataHistory[key].shift();
            }
        });
    }

    /* ========================================
       DISPLAY UPDATES
       ======================================== */

    updateAllDisplays() {
        this.updateBatteryVoltage();
        this.updateACVoltage();
        this.updateOutputPower();
        this.updateTemperature();
        this.updateAdvancedMetrics();
        this.updateCharts();
        this.updateLastUpdateTime();
    }

    updateBatteryVoltage() {
        const voltage = this.currentData.batteryVoltage.toFixed(2);
        document.getElementById('batteryVoltage').textContent = voltage;
        document.getElementById('batteryMin').textContent = this.minMaxData.batteryVoltage.min.toFixed(1);
        document.getElementById('batteryMax').textContent = this.minMaxData.batteryVoltage.max.toFixed(1);
    }

    updateACVoltage() {
        const voltage = this.currentData.acVoltage.toFixed(2);
        document.getElementById('acVoltage').textContent = voltage;
        document.getElementById('acMin').textContent = this.minMaxData.acVoltage.min.toFixed(1);
        document.getElementById('acMax').textContent = this.minMaxData.acVoltage.max.toFixed(1);
        document.getElementById('frequency').textContent = this.currentData.frequency.toFixed(2);
    }

    updateOutputPower() {
        const power = this.currentData.outputPower;
        document.getElementById('outputPower').textContent = power.toLocaleString();
        document.getElementById('powerMin').textContent = this.minMaxData.outputPower.min.toLocaleString();
        document.getElementById('powerMax').textContent = this.minMaxData.outputPower.max.toLocaleString();
        
        // Update load level in overview
        const loadPercent = (power / 5000) * 100;
        document.getElementById('loadLevel').textContent = Math.round(loadPercent) + '%';
    }

    updateTemperature() {
        const temp = this.currentData.temperature;
        document.getElementById('temperature').textContent = temp;
        document.getElementById('tempMin').textContent = this.minMaxData.temperature.min;
        document.getElementById('tempMax').textContent = this.minMaxData.temperature.max;

        // Update temperature status
        const tempStatus = this.getTempStatus(temp);
        const tempElement = document.getElementById('temperature');
        tempElement.parentElement.style.color = this.getStatusColor(tempStatus);
    }

    updateAdvancedMetrics() {
        // Frequency and status
        const freqStatus = Math.abs(this.currentData.frequency - 50) < 0.5 ? 'Normal' : 'Warning';
        document.getElementById('frequencyStatus').textContent = freqStatus;
        document.getElementById('frequencyBar').style.width = ((this.currentData.frequency / 52) * 100) + '%';

        // Battery SOC
        document.getElementById('batterySoc').textContent = this.currentData.batterySoc;
        document.getElementById('socBar').style.width = this.currentData.batterySoc + '%';
        const socStatus = this.getSocStatus(this.currentData.batterySoc);
        document.getElementById('socStatus').textContent = socStatus;

        // Efficiency
        document.getElementById('inverterEfficiency').textContent = this.currentData.inverterEfficiency.toFixed(1);
        document.getElementById('efficiencyBar').style.width = this.currentData.inverterEfficiency + '%';
        document.getElementById('efficiency').textContent = this.currentData.inverterEfficiency.toFixed(1) + '%';

        // Input Current
        document.getElementById('inputCurrent').textContent = this.currentData.inputCurrent.toFixed(1);
        document.getElementById('currentBar').style.width = Math.min(this.currentData.inputCurrent, 100) + '%';

        // Output Current
        document.getElementById('outputCurrent').textContent = this.currentData.outputCurrent.toFixed(1);
        document.getElementById('outputCurrentBar').style.width = (this.currentData.outputCurrent / 50) * 100 + '%';

        // Power Factor
        document.getElementById('powerFactor').textContent = this.currentData.powerFactor.toFixed(2);
        document.getElementById('powerFactorBar').style.width = (this.currentData.powerFactor * 100) + '%';
    }

    updateCharts() {
        // Update mini chart SVG polylines with data history
        this.updateChart('battery', this.dataHistory.batteryVoltage, 45, 52);
        this.updateChart('ac', this.dataHistory.acVoltage, 220, 240);
        this.updateChart('power', this.dataHistory.outputPower, 0, 5000);
        this.updateChart('temp', this.dataHistory.temperature, 20, 50);
    }

    updateChart(type, data, min, max) {
        if (data.length === 0) return;

        const points = data.map((value, index) => {
            const x = (index / 10) * 100;
            const normalized = ((value - min) / (max - min)) * 100;
            const y = 30 - (normalized / 100) * 30;
            return `${x},${y}`;
        }).join(' ');

        const element = document.getElementById(type + 'Line');
        if (element) {
            element.setAttribute('points', points);
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = timeString;
    }

    /* ========================================
       STATUS & UTILITY METHODS
       ======================================== */

    getTempStatus(temp) {
        if (temp < 20) return 'Cold';
        if (temp < 30) return 'Good';
        if (temp < 40) return 'Warm';
        if (temp < 50) return 'Hot';
        return 'Critical';
    }

    getSocStatus(soc) {
        if (soc > 80) return 'Excellent';
        if (soc > 60) return 'Good';
        if (soc > 40) return 'Fair';
        if (soc > 20) return 'Low';
        return 'Critical';
    }

    getStatusColor(status) {
        const colors = {
            'Good': '#66bb6a',
            'Excellent': '#66bb6a',
            'Fair': '#ffa726',
            'Low': '#ef5350',
            'Critical': '#d32f2f',
            'Warm': '#ffa726',
            'Hot': '#ff6f00',
            'Normal': '#66bb6a',
            'Warning': '#ffa726'
        };
        return colors[status] || '#90959e';
    }

    updateStatusBadge(status) {
        const badge = document.getElementById('statusBadge');
        if (status === 'ONLINE') {
            badge.textContent = 'ONLINE';
            badge.classList.remove('offline');
        } else {
            badge.textContent = 'OFFLINE';
            badge.classList.add('offline');
        }
    }

    /* ========================================
       UPTIME COUNTER
       ======================================== */

    startUptimeCounter() {
        this.uptimeInterval = setInterval(() => {
            if (this.isRunning) {
                const elapsedMs = Date.now() - this.startTime;
                const elapsedSeconds = Math.floor(elapsedMs / 1000);

                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                const seconds = elapsedSeconds % 60;

                const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
                document.getElementById('uptime').textContent = uptimeString;

                // Determine operation mode
                const opMode = this.getOperationMode();
                document.getElementById('operationMode').textContent = opMode;
            }
        }, 1000);
    }

    getOperationMode() {
        const power = this.currentData.outputPower;
        const soc = this.currentData.batterySoc;

        if (power > 3000) return 'Full Load';
        if (power > 1500) return 'High Load';
        if (power > 500) return 'Normal';
        if (power > 0) return 'Light Load';
        return 'Standby';
    }

    /* ========================================
       EVENT LOGGING
       ======================================== */

    logEvent(message, type = 'info') {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const logsContainer = document.querySelector('.logs-container');
        if (!logsContainer) return;

        const logItem = document.createElement('div');
        logItem.className = `log-item alert-${type}`;

        const icon = {
            'info': 'ℹ',
            'success': '✓',
            'warning': '⚠',
            'danger': '✕'
        }[type] || 'ℹ';

        logItem.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-icon">${icon}</span>
            <span class="log-message">${message}</span>
        `;

        // Insert at the top and remove oldest if more than 4
        logsContainer.insertBefore(logItem, logsContainer.firstChild);
        while (logsContainer.children.length > 4) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
    }

    /* ========================================
       CLEANUP
       ======================================== */

    destroy() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.uptimeInterval) clearInterval(this.uptimeInterval);
    }
}

/* ========================================
   APPLICATION INITIALIZATION
   ======================================== */

let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new InverterDashboard();
    console.log('✓ ESP32-C3 Inverter Dashboard initialized');
    console.log('Type "dashboard" in console to access the dashboard object');
});

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Page visibility change handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Dashboard paused (tab inactive)');
    } else {
        console.log('Dashboard resumed (tab active)');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});

/* ========================================
   PERFORMANCE OPTIMIZATION
   ======================================== */

// RequestAnimationFrame for smooth updates if needed
function scheduleUpdate(callback, interval) {
    let lastTime = 0;
    
    return function update() {
        const now = Date.now();
        if (now - lastTime >= interval) {
            callback();
            lastTime = now;
        }
        requestAnimationFrame(update);
    };
}

// Monitor for performance issues
if (window.performance && window.performance.memory) {
    setInterval(() => {
        const memory = window.performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
            console.warn('⚠️ High memory usage detected');
        }
    }, 30000);
}

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    // Uncomment to enable offline support
    // navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
}
