require('dotenv').config(); // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB using env variable
mongoose.connect(`${process.env.MONGODB_URI}/CNC_GENIE`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Could not connect to MongoDB Atlas:', err));

// Define the DeviceData schema and model
const deviceDataSchema = new mongoose.Schema({
    deviceno: Number,
    date: String,
    time: String,
    ch1: Number,
    ch2: Number,
    ch3: Number,
    ch4: Number,
    ch5: Number,
    ch6: Number,
    ch7: Number,
    ch8: Number,
    prevtime: Number,
    logdate: String,
    longtime: String,
});

const DeviceData = mongoose.model('DeviceData', deviceDataSchema);

// Helper function to get current IST date/time
function getCurrentIndianDateTime() {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata' };

    const year = now.toLocaleDateString('en-IN', { ...options, year: '2-digit' });
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const logdate = `${year}/${month}/${day}`;
    const longtime = now.toLocaleTimeString('en-IN', { ...options, hour12: false });

    return { logdate, longtime };
}

// POST endpoint
app.post('/add-user', async (req, res) => {
    console.log('Received POST request:', req.body);

    const { deviceno, date, time, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, prevtime } = req.body;
    const { logdate, longtime } = getCurrentIndianDateTime();

    const newDeviceData = new DeviceData({
        deviceno,
        date,
        time,
        ch1,
        ch2,
        ch3,
        ch4,
        ch5,
        ch6,
        ch7,
        ch8,
        prevtime,
        logdate,
        longtime,
    });

    try {
        const savedData = await newDeviceData.save();
        console.log('Data saved:', savedData);
        res.status(201).send('Device data added successfully');
    } catch (error) {
        console.error('MongoDB save error:', error);
        res.status(500).send('Error saving device data to database');
    }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
