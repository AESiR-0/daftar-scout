require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Client } = require('pg');
const WebSocket = require('ws');
const fs = require('fs');

// --- ENV VALIDATION ---
const REQUIRED_ENV = [
  'PG_HOST', 'PG_PORT', 'PG_USER', 'PG_PASSWORD', 'PG_DATABASE', 'WS_SERVER'
];


// --- CONFIG ---
const PG_CONFIG = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('../../global-bundle.pem').toString(), // Use the cert bundle here

  },
};
const WS_SERVER = process.env.WS_SERVER || "ws://localhost:4000";

// --- DB ---
const pg = new Client(PG_CONFIG);
pg.connect();
pg.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] PostgreSQL error:`, err);
  process.exit(1);
});

// --- WebSocket ---
let ws;
function connectWS() {
  ws = new WebSocket(WS_SERVER);
  ws.on('open', () => log('WebSocket connected'));
  ws.on('close', () => setTimeout(connectWS, 2000));
  ws.on('error', (err) => { log('WebSocket error: ' + err.message); ws.close(); });
}
connectWS();

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

// --- LISTEN/NOTIFY ---
const CHANNEL = 'new_notification';
pg.query(`LISTEN ${CHANNEL}`);
pg.on('notification', async (msg) => {
  if (msg.channel === CHANNEL) {
    try {
      // The payload is the notification id
      const notificationId = msg.payload;
      console.log(`[notifications] Received notification for id: ${notificationId}`);
      // Optionally, fetch the full notification from DB
      const { rows } = await pg.query('SELECT * FROM notifications WHERE id = $1', [notificationId]);
      const notification = rows[0] || { id: notificationId };
      sendNotification(notification);
    } catch (err) {
      log('Error fetching notification:', err.message);
      console.error(`[notifications] Error fetching notification:`, err);
    }
  }
});

function sendNotification(notification) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'notification', notification }));
    log('Notification relayed:', notification.id);
    console.log(`[notifications] Notification relayed to WebSocket: ${notification.id}`);
  } else {
    console.error('[notifications] WebSocket not open, could not relay notification:', notification.id);
  }
}

log('Notification relay worker started.'); 