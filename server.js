const express = require('express');
const webpush = require('web-push');
const schedule = require('node-schedule');
const app = express();
app.use(express.json());

// Set VAPID details
webpush.setVapidDetails(
    'mailto:pradipdevkota007@gmail.com', // Use mailto: format for the email
    'BOnFVmQVdrFQkSjjiAeL38URIkISYcCsyiUnPEd2zfZORiImrIYUqYhDjR1g-D1l7qLE9qIRVEEtzoDRdkN3MrI', // Public key
    'M7ujvMsHEGCLpWstJVHnT_8lgh6c__gGcmbDfOfu9Mk' // Private key
);

// Store subscriptions
const subscriptions = [];

// Function to convert English date to Nepali date (placeholder)
function englishToNepali(engDate) {
    // Placeholder: Port the client-side englishToNepali function here
    return { year: 2082, month: 5, day: 2 }; // Replace with actual logic
}

function formatNepaliDate(year, month, day) {
    const nepaliMonths = [
        "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज",
        "कार्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत्र"
    ];
    const devanagariDigits = {
        '0': '०',
        '1': '१',
        '2': '२',
        '3': '३',
        '4': '४',
        '5': '५',
        '6': '६',
        '7': '७',
        '8': '८',
        '9': '९'
    };
    const toDevanagariNumber = num => num.toString().split('').map(digit => devanagariDigits[digit] || digit).join('');
    return `${toDevanagariNumber(year)} ${nepaliMonths[month - 1]} ${toDevanagariNumber(day)}`;
}

function formatEnglishDate(date) {
    const englishMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${date.getDate()} ${englishMonths[date.getMonth()]} ${date.getFullYear()}`;
}

// Endpoint to save subscriptions
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({ success: true });
});

// Function to send daily notification
function sendDailyNotification() {
    const now = new Date();
    const nepaliDate = englishToNepali(now);
    const payload = {
        title: 'Today’s Date',
        body: `English: ${formatEnglishDate(now)}\nNepali: ${formatNepaliDate(nepaliDate.year, nepaliDate.month, nepaliDate.day)}`,
        url: 'http://localhost:3000' // Update to your website URL when deployed
    };

    Promise.all(
            subscriptions.map(sub =>
                webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => console.error('Error sending to sub:', err))
            )
        )
        .then(() => console.log('Daily notification sent'))
        .catch(err => console.error('Error sending notifications:', err));
}

// Schedule daily notification at 8 AM
schedule.scheduleJob('0 8 * * *', sendDailyNotification);

// Manual endpoint for testing notifications
app.post('/send-notification', (req, res) => {
    const now = new Date();
    const nepaliDate = englishToNepali(now);
    const payload = {
        title: 'Nepali Calendar Update',
        body: `English: ${formatEnglishDate(now)}\nNepali: ${formatNepaliDate(nepaliDate.year, nepaliDate.month, nepaliDate.day)}`,
        url: 'http://localhost:3000' // Update to your website URL when deployed
    };
    Promise.all(
            subscriptions.map(sub =>
                webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => console.error('Error sending to sub:', err))
            )
        )
        .then(() => res.status(200).json({ success: true }))
        .catch(err => {
            console.error('Error sending notifications:', err);
            res.status(500).json({ error: 'Failed to send notifications' });
        });
});


// Add this before app.listen()
app.get('/send-notification', (req, res) => {
    const now = new Date();
    const nepaliDate = englishToNepali(now);
    const payload = {
        title: 'Nepali Calendar Update',
        body: `English: ${formatEnglishDate(now)}\nNepali: ${formatNepaliDate(nepaliDate.year, nepaliDate.month, nepaliDate.day)}`,
        url: 'http://localhost:3000'
    };
    Promise.all(
            subscriptions.map(sub =>
                webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => console.error('Error sending to sub:', err))
            )
        )
        .then(() => res.status(200).json({ success: true }))
        .catch(err => {
            console.error('Error sending notifications:', err);
            res.status(500).json({ error: 'Failed to send notifications' });
        });
});

app.listen(3000, () => console.log('Server running on port 3000'));