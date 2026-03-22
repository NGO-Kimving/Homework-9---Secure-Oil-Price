const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// ==========================================
// STATIC DATA
// ==========================================
const oilPrices = {
  "market": "Global Energy Exchange",
  "last_updated": "2026-03-15T12:55:00Z",
  "currency": "USD",
  "data": [
    { "symbol": "WTI", "name": "West Texas Intermediate", "price": 78.45, "change": 0.12 },
    { "symbol": "BRENT", "name": "Brent Crude", "price": 82.30, "change": -0.05 },
    { "symbol": "NAT_GAS", "name": "Natural Gas", "price": 2.15, "change": 0.02 }
  ]
};

// ==========================================
// MIDDLEWARE STACK (Applied in Strict Order)
// ==========================================

// 1. IP Filtering Middleware
const ipFilter = (req, res, next) => {
    const allowedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
    
    if (allowedIps.includes(req.ip)) {
        next(); 
    } else {
        res.status(403).json({ error: '403 Forbidden: Access restricted to local IP addresses.' });
    }
};
app.use(ipFilter);

// 2. CORS Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));

// 3. Rate Limiting Middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10, // 10 requests per minute
    message: { error: '429 Too Many Requests: You have exceeded the 10 requests per minute limit.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use(limiter);


// ==========================================
// AUTHENTICATION MIDDLEWARES
// ==========================================

// Bearer Token Auth (For the JSON API)
const API_TOKEN = 'supersecrettoken123';
const bearerAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === API_TOKEN) {
            return next(); 
        }
    }
    res.status(401).json({ error: '401 Unauthorized: Invalid or missing Bearer token.' });
};

// Basic Auth (For the HTML Dashboard)
const BASIC_USER = 'admin';
const BASIC_PASS = 'password123';
const basicAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Energy Dashboard"');
        return res.status(401).send('Authentication required.');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');

    if (username === BASIC_USER && password === BASIC_PASS) {
        return next(); 
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Energy Dashboard"');
    res.status(401).send('Invalid credentials.');
};


// ==========================================
// ROUTE ENDPOINTS
// ==========================================

// AUTOMATIC REDIRECT: Sends users from the blank root URL straight to the dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// GET /api/oil-prices -> Protected by Bearer Token
app.get('/api/oil-prices', bearerAuth, (req, res) => {
    res.json(oilPrices);
});

// GET /dashboard -> Protected by Basic Auth
app.get('/dashboard', basicAuth, (req, res) => {
    let tableRows = '';
    oilPrices.data.forEach(item => {
        const color = item.change >= 0 ? 'green' : 'red';
        const sign = item.change > 0 ? '+' : '';
        tableRows += `<tr>
            <td style="padding: 8px; border: 1px solid #ccc;">${item.symbol}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">$${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ccc; color: ${color};">${sign}${item.change}</td>
        </tr>`;
    });

    const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Energy Dashboard</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: auto;">
                <h2>${oilPrices.market} Dashboard</h2>
                <p><strong>Currency:</strong> ${oilPrices.currency} | <strong>Updated:</strong> ${oilPrices.last_updated}</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ccc;">Symbol</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Name</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Price</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Change</th>
                    </tr>
                    ${tableRows}
                </table>
                <br>
                <a href="/logout" style="padding: 10px 15px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Logout</a>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});

// GET /logout -> Clears Basic Auth
app.get('/logout', (req, res) => {
    res.status(401).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
            <h2 style="color: #28a745;">Successfully Logged Out</h2>
            <p>Your session has been cleared.</p>
            <a href="/dashboard">Return to Login</a>
        </div>
    `);
});

// Start the server
app.listen(PORT, () => {
console.log(`Server running at http://127.0.0.1:${PORT}`);
});