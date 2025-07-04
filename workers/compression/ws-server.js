const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();

const DEBUG = process.env.DEBUG === 'true';
const PORT = process.env.WS_PORT || 4000;
const wss = new WebSocket.Server({ port: PORT }, () => {
  log(`WebSocket Server started on port ${PORT}`);
});

const clients = {}; // jobId => Set of ws

function log(msg) {
  if (DEBUG) console.log(`[${new Date().toISOString()}] ${msg}`);
}

function cleanDeadClients() {
  for (const jobId in clients) {
    clients[jobId] = new Set(
      [...clients[jobId]].filter(ws => ws.readyState === WebSocket.OPEN)
    );
    if (clients[jobId].size === 0) delete clients[jobId];
  }
}

wss.on('connection', (ws) => {
  log('Client connected');

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.subscribe && typeof data.jobId === 'string') {
        const { jobId } = data;
        if (!clients[jobId]) clients[jobId] = new Set();
        clients[jobId].add(ws);
        log(`Client subscribed to jobId ${jobId}`);
        return;
      }

      if (typeof data.jobId === 'string' && typeof data.log === 'string') {
        const targets = clients[data.jobId] || new Set();
        targets.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        log(`Broadcast log for jobId ${data.jobId}`);
        return;
      }

    } catch (err) {
      log(`Invalid message format: ${err.message}`);
    }
  });

  ws.on('close', () => {
    log('Client disconnected');
    for (const jobId in clients) {
      clients[jobId].delete(ws);
      if (clients[jobId].size === 0) delete clients[jobId];
    }
  });

  ws.on('error', (err) => {
    log(`WebSocket error: ${err.message}`);
  });
});

// Clean up dead connections periodically
setInterval(cleanDeadClients, 60 * 1000);

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    log(`Shutting down gracefully (${signal})...`);
    wss.clients.forEach(client => {
      try {
        client.close();
      } catch {}
    });
    wss.close(() => process.exit(0));
  });
});
