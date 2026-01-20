const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Store status in memory (resets on restart, but that's fine for a live dashboard)
let currentStatus = {
    online: false,
    lastUpdate: 0,
    data: {}
};

// RECEIVE HEARTBEAT
app.post('/update', (req, res) => {
    const data = req.body;
    console.log("Received update:", data);

    currentStatus = {
        online: true,
        lastUpdate: Date.now(),
        data: data
    };

    res.json({ success: true });
});

// GET STATUS
app.get('/status', (req, res) => {
    // Check timeout (if no heartbeat for 60 seconds, mark as offline)
    const timeSinceLast = Date.now() - currentStatus.lastUpdate;
    if (timeSinceLast > 60000 && currentStatus.online) {
        currentStatus.online = false;
        currentStatus.data.status = "Timeout (Offline)";
    }

    res.json(currentStatus);
});

// Serve Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Somatic Status Server running on port ${PORT}`);
});
