const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static('public'));

// Store status in memory (resets on restart, but that's fine for a live dashboard)
let currentStatus = {
    online: false,
    lastUpdate: 0,
    data: {},
    sessionStart: Date.now()
};

// Store event logs (keep last 20 events for performance)
let eventLogs = [];
const MAX_LOGS = 20;

// Track refresh history for health metrics
let lastRefreshTime = null;

// Server lifetime tracking
const serverStartTime = Date.now();

// RECEIVE HEARTBEAT
app.post('/update', (req, res) => {
    const data = req.body;
    console.log("Received update:", data);

    currentStatus = {
        ...currentStatus,
        online: true,
        lastUpdate: Date.now(),
        data: data
    };

    res.json({ success: true });
});

// RECEIVE EVENT LOG
app.post('/log', (req, res) => {
    const message = typeof req.body === 'string' ? req.body : req.body.message;
    const timestamp = new Date().toISOString();

    const logEntry = {
        timestamp,
        message,
        time: new Date().toLocaleTimeString()
    };

    console.log("Event log:", logEntry);

    // Track refresh events for health metrics
    if (message.includes('refreshed') || message.includes('Detected refresh')) {
        lastRefreshTime = Date.now();
    }

    eventLogs.unshift(logEntry); // Add to beginning
    if (eventLogs.length > MAX_LOGS) {
        eventLogs = eventLogs.slice(0, MAX_LOGS);
    }

    res.json({ success: true });
});

// GET LOGS
app.get('/logs', (req, res) => {
    res.json({ logs: eventLogs });
});

// GET STATUS
app.get('/status', (req, res) => {
    // Check timeout (if no heartbeat for 60 seconds, mark as offline)
    const timeSinceLast = Date.now() - currentStatus.lastUpdate;
    if (timeSinceLast > 60000 && currentStatus.online) {
        currentStatus.online = false;
        currentStatus.data.status = "Timeout (Offline)";
    }

    // Calculate session uptime
    const sessionUptimeSeconds = Math.floor((Date.now() - currentStatus.sessionStart) / 1000);

    // Calculate server lifetime
    const serverLifetimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

    // Calculate time since last refresh
    const timeSinceRefresh = lastRefreshTime ? Math.floor((Date.now() - lastRefreshTime) / 1000) : null;

    // Determine health status based on recent refreshes
    const refreshes = currentStatus.data.crashes_120s || 0;
    let health = 'excellent';
    if (refreshes >= 4) health = 'critical';
    else if (refreshes >= 2) health = 'warning';
    else if (refreshes >= 1) health = 'good';

    res.json({
        ...currentStatus,
        sessionUptimeSeconds,
        serverLifetimeSeconds,
        timeSinceRefresh,
        health,
        lastUpdateTimestamp: currentStatus.lastUpdate
    });
});

// Serve Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Somatic Status Server running on port ${PORT}`);
});
