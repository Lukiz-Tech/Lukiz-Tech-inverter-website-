/* ========================================
   ESP32-C3 INVERTER MONITORING DASHBOARD
   Production-Ready JavaScript Application
   ======================================== */

class DOMElementManager {
    /**
     * Safely get DOM element with null checks
     */
    static getElement(id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`⚠️ DOM element not found: #${id}`);
                return null;
            }
            return element;
        } catch (error) {
            console.error(`❌ Error getting element #${id}:`, error);
            return null;
        }
    }

    /**
     * Safely set text content
     */
    static setText(id, value) {
        try {
            const element = this.getElement(id);
            if (element && value !== undefined && value !== null) {
                element.textContent = String(value);
            }
        } catch (error) {
            console.error(`❌ Error setting text for #${id}:`, error);
        }
    }

    /**
     * Safely set attribute
     */
    static setAttribute(id, attr, value) {
        try {
            const element = this.getElement(id);
            if (element && value !== undefined && value !== null) {
                element.setAttribute(attr, value);
            }
        } catch (error) {
            console.error(`❌ Error setting attribute on #${id}:`, error);
        }
    }

    /**
     * Safely set style property
     */
    static setStyle(id, property, value) {
        try {
            const element = this.getElement(id);
            if (element && value !== undefined && value !== null) {
                element.style[property] = String(value);
            }
        } catch (error) {
            console.error(`❌ Error setting style on #${id}:`, error);
        }
    }

    /**
     * Safely add/remove class
     */
    static toggleClass(id, className, force) {
        try {
            const element = this.getElement(id);
            if (element) {
                if (force !== undefined) {
                    element.classList.toggle(className, force);
                } else {
                    element.classList.toggle(className);
                }
            }
        } catch (error) {
            console.error(`❌ Error toggling class on #${id}:`, error);
        }
    }

    /**
     * Safely query selector within element
     */
    static querySelector(selector) {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                console.warn(`⚠️ Element not found: ${selector}`);
                return null;
            }
            return element;
        } catch (error) {
            console.error(`❌ Error querying selector ${selector}:`, error);
            return null;
        }
    }
}

class InverterDashboard {
    constructor() {
        // System state
        this.isRunning = false;
        this.lastUpdateTime = new Date();
        this.startTime = Date.now();
        this.updateInterval = null;
        this.uptimeInterval = null;
        this.connectionCheckInterval = null;

        // Rendering optimization
        this.renderScheduled = false;
        this.pendingUpdates = new Set();
        this.lastRenderTime = 0;
        this.minRenderInterval = 100; // ms - prevent rapid re-renders

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

        // Previous data for change detection
        this.previousData = JSON.parse(JSON.stringify(this.currentData));

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

        // Error tracking
        this.errorCount = 0;
        this.maxErrors = 10;
        this.isOnline = false;

        // Initialize
        this.initializeDOM();
        this.initializeEventListeners();
        this.startDashboard();
    }

    /**
     * Initialize and validate DOM elements
     */
    initializeDOM() {
        const requiredElements = [
            'statusBadge', 'operationMode', 'uptime', 'lastUpdate',
            'efficiency', 'loadLevel', 'errorCount',
            'batteryVoltage', 'batteryMin', 'batteryMax',
            'acVoltage', 'acMin', 'acMax', 'frequency',
            'outputPower', 'powerMin', 'powerMax',
            'temperature', 'tempMin', 'tempMax',
            'batterySoc', 'socBar', 'socStatus',
            'inverterEfficiency', 'efficiencyBar',
            'inputCurrent', 'currentBar',
            'outputCurrent', 'outputCurrentBar',
            'powerFactor', 'powerFactorBar'
        ];

        let missingElements = 0;
        requiredElements.forEach(id => {
            if (!DOMElementManager.getElement(id)) {
                missingElements++;
            }
        });

        if (missingElements > 0) {
            console.warn(`⚠️ ${missingElements} required DOM elements missing`);
        }

        console.log(`✓ DOM initialization complete (${requiredElements.length - missingElements}/${requiredElements.length} elements found)`);
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        try {
            // Connection status monitoring
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());

            // Visibility change
            document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

            // Cleanup on unload
            window.addEventListener('beforeunload', () => this.destroy());

            console.log('✓ Event listeners initialized');
        } catch (error) {
            console.error('❌ Error initializing event listeners:', error);
        }
    }

    /**
     * Start the dashboard
     */
    startDashboard() {
        try {
            this.isRunning = true;
            this.simulateStartup();
            this.startUptimeCounter();
            console.log('✓ Dashboard started');
        } catch (error) {
            console.error('❌ Error starting dashboard:', error);
            this.handleError(error);
        }
    }

    /**
     * Simulate system startup sequence
     */
    simulateStartup() {
        try {
            console.log('🔌 ESP32-C3 Inverter Monitor Starting...');

            setTimeout(() => {
                try {
                    this.updateStatusBadge('ONLINE');
                    this.isOnline = true;
                    this.logEvent('System started successfully', 'info');
                } catch (error) {
                    console.error('❌ Error in startup sequence:', error);
                }
            }, 500);

            setTimeout(() => {
                try {
                    this.logEvent('Battery connection established', 'success');
                } catch (error) {
                    console.error('❌ Error logging event:', error);
                }
            }, 1000);

            setTimeout(() => {
                try {
                    this.logEvent('AC grid synchronized', 'info');
                } catch (error) {
                    console.error('❌ Error logging event:', error);
                }
            }, 1500);

            setTimeout(() => {
                try {
                    this.logEvent('All sensors initialized', 'success');
                    this.startDataSimulation();
                } catch (error) {
                    console.error('❌ Error starting data simulation:', error);
                }
            }, 2000);
        } catch (error) {
            console.error('❌ Error in simulateStartup:', error);
            this.handleError(error);
        }
    }

    /**
     * Start data simulation with error handling
     */
    startDataSimulation() {
        try {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }

            this.updateInterval = setInterval(() => {
                try {
                    this.simulateSensorData();
                    this.scheduleRender();
                } catch (error) {
                    console.error('❌ Error in data simulation:', error);
                    this.handleError(error);
                }
            }, 2000);

            console.log('✓ Data simulation started');
        } catch (error) {
            console.error('❌ Error starting data simulation:', error);
            this.handleError(error);
        }
    }

    /**
     * Simulate realistic sensor data
     */
    simulateSensorData() {
        try {
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

            this.updateMinMax();
            this.storeDataHistory();
            this.lastUpdateTime = new Date();

            // Reset error count on successful update
            if (this.errorCount > 0) {
                this.errorCount = Math.max(0, this.errorCount - 1);
            }
        } catch (error) {
            console.error('❌ Error in simulateSensorData:', error);
            this.handleError(error);
        }
    }

    /**
     * Add realistic noise to sensor values
     */
    addNoise(baseValue, range) {
        try {
            if (!Number.isFinite(baseValue) || !Number.isFinite(range)) {
                console.warn('⚠️ Invalid noise parameters:', { baseValue, range });
                return baseValue;
            }
            const noise = (Math.random() - 0.5) * range;
            return baseValue + noise;
        } catch (error) {
            console.error('❌ Error adding noise:', error);
            return baseValue;
        }
    }

    /**
     * Update min/max tracking
     */
    updateMinMax() {
        try {
            Object.keys(this.minMaxData).forEach(key => {
                const current = this.currentData[key];
                if (Number.isFinite(current)) {
                    if (current < this.minMaxData[key].min) {
                        this.minMaxData[key].min = current;
                    }
                    if (current > this.minMaxData[key].max) {
                        this.minMaxData[key].max = current;
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error updating min/max:', error);
        }
    }

    /**
     * Store data history for charts
     */
    storeDataHistory() {
        try {
            Object.keys(this.dataHistory).forEach(key => {
                const value = this.currentData[key];
                if (Number.isFinite(value)) {
                    this.dataHistory[key].push(value);
                    if (this.dataHistory[key].length > 10) {
                        this.dataHistory[key].shift();
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error storing data history:', error);
        }
    }

    /**
     * Schedule optimized render (debounced)
     */
    scheduleRender() {
        try {
            if (this.renderScheduled) {
                return;
            }

            const now = Date.now();
            const timeSinceLastRender = now - this.lastRenderTime;

            if (timeSinceLastRender < this.minRenderInterval) {
                this.renderScheduled = true;
                setTimeout(() => {
                    this.renderScheduled = false;
                    this.updateAllDisplays();
                }, this.minRenderInterval - timeSinceLastRender);
            } else {
                this.updateAllDisplays();
            }

            this.lastRenderTime = now;
        } catch (error) {
            console.error('❌ Error scheduling render:', error);
        }
    }

    /**
     * Update all displays with change detection
     */
    updateAllDisplays() {
        try {
            if (!this.isOnline) return;

            this.updateBatteryVoltage();
            this.updateACVoltage();
            this.updateOutputPower();
            this.updateTemperature();
            this.updateAdvancedMetrics();
            this.updateCharts();
            this.updateLastUpdateTime();

            this.previousData = JSON.parse(JSON.stringify(this.currentData));
        } catch (error) {
            console.error('❌ Error updating all displays:', error);
            this.handleError(error);
        }
    }

    /**
     * Update battery voltage display
     */
    updateBatteryVoltage() {
        try {
            const voltage = this.currentData.batteryVoltage.toFixed(2);
            const min = this.minMaxData.batteryVoltage.min.toFixed(1);
            const max = this.minMaxData.batteryVoltage.max.toFixed(1);

            DOMElementManager.setText('batteryVoltage', voltage);
            DOMElementManager.setText('batteryMin', min);
            DOMElementManager.setText('batteryMax', max);
        } catch (error) {
            console.error('❌ Error updating battery voltage:', error);
        }
    }

    /**
     * Update AC voltage display
     */
    updateACVoltage() {
        try {
            const voltage = this.currentData.acVoltage.toFixed(2);
            const min = this.minMaxData.acVoltage.min.toFixed(1);
            const max = this.minMaxData.acVoltage.max.toFixed(1);
            const frequency = this.currentData.frequency.toFixed(2);

            DOMElementManager.setText('acVoltage', voltage);
            DOMElementManager.setText('acMin', min);
            DOMElementManager.setText('acMax', max);
            DOMElementManager.setText('frequency', frequency);
        } catch (error) {
            console.error('❌ Error updating AC voltage:', error);
        }
    }

    /**
     * Update output power display
     */
    updateOutputPower() {
        try {
            const power = this.currentData.outputPower;
            const min = this.minMaxData.outputPower.min;
            const max = this.minMaxData.outputPower.max;
            const loadPercent = Math.round((power / 5000) * 100);

            DOMElementManager.setText('outputPower', power.toLocaleString());
            DOMElementManager.setText('powerMin', min.toLocaleString());
            DOMElementManager.setText('powerMax', max.toLocaleString());
            DOMElementManager.setText('loadLevel', `${loadPercent}%`);
        } catch (error) {
            console.error('❌ Error updating output power:', error);
        }
    }

    /**
     * Update temperature display
     */
    updateTemperature() {
        try {
            const temp = this.currentData.temperature;
            const min = this.minMaxData.temperature.min;
            const max = this.minMaxData.temperature.max;

            DOMElementManager.setText('temperature', String(temp));
            DOMElementManager.setText('tempMin', String(min));
            DOMElementManager.setText('tempMax', String(max));
        } catch (error) {
            console.error('❌ Error updating temperature:', error);
        }
    }

    /**
     * Update advanced metrics
     */
    updateAdvancedMetrics() {
        try {
            // Frequency and status
            const freqStatus = Math.abs(this.currentData.frequency - 50) < 0.5 ? 'Normal' : 'Warning';
            const freqPercent = Math.max(0, Math.min(100, (this.currentData.frequency / 52) * 100));

            DOMElementManager.setText('frequencyStatus', freqStatus);
            DOMElementManager.setStyle('frequencyBar', 'width', `${freqPercent}%`);

            // Battery SOC
            DOMElementManager.setText('batterySoc', String(this.currentData.batterySoc));
            DOMElementManager.setStyle('socBar', 'width', `${this.currentData.batterySoc}%`);
            const socStatus = this.getSocStatus(this.currentData.batterySoc);
            DOMElementManager.setText('socStatus', socStatus);

            // Efficiency
            DOMElementManager.setText('inverterEfficiency', this.currentData.inverterEfficiency.toFixed(1));
            DOMElementManager.setStyle('efficiencyBar', 'width', `${this.currentData.inverterEfficiency}%`);
            DOMElementManager.setText('efficiency', `${this.currentData.inverterEfficiency.toFixed(1)}%`);

            // Input Current
            DOMElementManager.setText('inputCurrent', this.currentData.inputCurrent.toFixed(1));
            const inputCurrentPercent = Math.min(this.currentData.inputCurrent, 100);
            DOMElementManager.setStyle('currentBar', 'width', `${inputCurrentPercent}%`);

            // Output Current
            DOMElementManager.setText('outputCurrent', this.currentData.outputCurrent.toFixed(1));
            const outputCurrentPercent = (this.currentData.outputCurrent / 50) * 100;
            DOMElementManager.setStyle('outputCurrentBar', 'width', `${outputCurrentPercent}%`);

            // Power Factor
            DOMElementManager.setText('powerFactor', this.currentData.powerFactor.toFixed(2));
            DOMElementManager.setStyle('powerFactorBar', 'width', `${this.currentData.powerFactor * 100}%`);
        } catch (error) {
            console.error('❌ Error updating advanced metrics:', error);
        }
    }

    /**
     * Update charts with data history
     */
    updateCharts() {
        try {
            this.updateChart('battery', this.dataHistory.batteryVoltage, 45, 52);
            this.updateChart('ac', this.dataHistory.acVoltage, 220, 240);
            this.updateChart('power', this.dataHistory.outputPower, 0, 5000);
            this.updateChart('temp', this.dataHistory.temperature, 20, 50);
        } catch (error) {
            console.error('❌ Error updating charts:', error);
        }
    }

    /**
     * Update individual chart
     */
    updateChart(type, data, min, max) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                return;
            }

            const points = data
                .map((value, index) => {
                    if (!Number.isFinite(value)) return null;
                    const x = (index / 10) * 100;
                    const normalized = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
                    const y = 30 - (normalized / 100) * 30;
                    return `${x},${y}`;
                })
                .filter(p => p !== null)
                .join(' ');

            if (points) {
                DOMElementManager.setAttribute(`${type}Line`, 'points', points);
            }
        } catch (error) {
            console.error(`❌ Error updating ${type} chart:`, error);
        }
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            DOMElementManager.setText('lastUpdate', timeString);
        } catch (error) {
            console.error('❌ Error updating last update time:', error);
        }
    }

    /**
     * Get status color
     */
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

    /**
     * Get SOC status
     */
    getSocStatus(soc) {
        if (soc > 80) return 'Excellent';
        if (soc > 60) return 'Good';
        if (soc > 40) return 'Fair';
        if (soc > 20) return 'Low';
        return 'Critical';
    }

    /**
     * Get temperature status
     */
    getTempStatus(temp) {
        if (temp < 20) return 'Cold';
        if (temp < 30) return 'Good';
        if (temp < 40) return 'Warm';
        if (temp < 50) return 'Hot';
        return 'Critical';
    }

    /**
     * Update status badge
     */
    updateStatusBadge(status) {
        try {
            const badge = DOMElementManager.getElement('statusBadge');
            if (badge) {
                badge.textContent = status;
                DOMElementManager.toggleClass('statusBadge', 'offline', status === 'OFFLINE');
            }
        } catch (error) {
            console.error('❌ Error updating status badge:', error);
        }
    }

    /**
     * Start uptime counter
     */
    startUptimeCounter() {
        try {
            if (this.uptimeInterval) {
                clearInterval(this.uptimeInterval);
            }

            this.uptimeInterval = setInterval(() => {
                try {
                    if (this.isRunning && this.isOnline) {
                        const elapsedMs = Date.now() - this.startTime;
                        const elapsedSeconds = Math.floor(elapsedMs / 1000);

                        const hours = Math.floor(elapsedSeconds / 3600);
                        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                        const seconds = elapsedSeconds % 60;

                        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
                        DOMElementManager.setText('uptime', uptimeString);

                        const opMode = this.getOperationMode();
                        DOMElementManager.setText('operationMode', opMode);
                    }
                } catch (error) {
                    console.error('❌ Error updating uptime:', error);
                }
            }, 1000);

            console.log('✓ Uptime counter started');
        } catch (error) {
            console.error('❌ Error starting uptime counter:', error);
        }
    }

    /**
     * Get operation mode
     */
    getOperationMode() {
        try {
            const power = this.currentData.outputPower;
            if (power > 3000) return 'Full Load';
            if (power > 1500) return 'High Load';
            if (power > 500) return 'Normal';
            if (power > 0) return 'Light Load';
            return 'Standby';
        } catch (error) {
            console.error('❌ Error getting operation mode:', error);
            return 'Unknown';
        }
    }

    /**
     * Log event safely
     */
    logEvent(message, type = 'info') {
        try {
            if (!message || typeof message !== 'string') {
                console.warn('⚠️ Invalid log message:', message);
                return;
            }

            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const logsContainer = DOMElementManager.querySelector('.logs-container');
            if (!logsContainer) {
                console.warn('⚠️ Logs container not found');
                return;
            }

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
                <span class="log-message">${this.escapeHtml(message)}</span>
            `;

            logsContainer.insertBefore(logItem, logsContainer.firstChild);
            while (logsContainer.children.length > 4) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        } catch (error) {
            console.error('❌ Error logging event:', error);
        }
    }

    /**
     * Escape HTML to prevent injection
     */
    escapeHtml(text) {
        try {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        } catch (error) {
            console.error('❌ Error escaping HTML:', error);
            return text;
        }
    }

    /**
     * Handle errors
     */
    handleError(error) {
        try {
            this.errorCount++;
            console.error(`❌ Error #${this.errorCount}:`, error);
            DOMElementManager.setText('errorCount', String(Math.min(this.errorCount, 99)));

            if (this.errorCount > this.maxErrors) {
                console.error('❌ Maximum errors exceeded. Dashboard may be unstable.');
                this.logEvent('Critical error - Dashboard unstable', 'danger');
            }
        } catch (e) {
            console.error('❌ Error in error handler:', e);
        }
    }

    /**
     * Handle online event
     */
    handleOnline() {
        try {
            console.log('✓ Network connection restored');
            this.logEvent('Network connection restored', 'success');
        } catch (error) {
            console.error('❌ Error handling online event:', error);
        }
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        try {
            console.log('⚠️ Network connection lost');
            this.logEvent('Network connection lost', 'warning');
        } catch (error) {
            console.error('❌ Error handling offline event:', error);
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        try {
            if (document.hidden) {
                console.log('⏸️ Dashboard paused (tab inactive)');
                if (this.updateInterval) clearInterval(this.updateInterval);
            } else {
                console.log('▶️ Dashboard resumed (tab active)');
                this.startDataSimulation();
            }
        } catch (error) {
            console.error('❌ Error handling visibility change:', error);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        try {
            if (this.updateInterval) clearInterval(this.updateInterval);
            if (this.uptimeInterval) clearInterval(this.uptimeInterval);
            if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);
            this.isRunning = false;
            console.log('✓ Dashboard cleaned up');
        } catch (error) {
            console.error('❌ Error in cleanup:', error);
        }
    }
}

/* ========================================
   APPLICATION INITIALIZATION
   ======================================== */

let dashboard;

/**
 * Initialize dashboard when DOM is ready
 */
function initializeDashboard() {
    try {
        if (dashboard) {
            console.warn('⚠️ Dashboard already initialized');
            return;
        }

        dashboard = new InverterDashboard();
        console.log('✓✓✓ ESP32-C3 Inverter Dashboard Ready ✓✓✓');
        console.log('Type "dashboard" in console to access the dashboard object');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        alert('Failed to initialize dashboard. Check console for details.');
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    // DOM is already ready
    initializeDashboard();
}

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
    console.error('❌ Uncaught error:', event.error);
    if (dashboard) {
        dashboard.handleError(event.error);
    }
});

/**
 * Global rejection handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    if (dashboard) {
        dashboard.handleError(event.reason);
    }
});

console.log('📊 ESP32-C3 Inverter Dashboard Script Loaded');
