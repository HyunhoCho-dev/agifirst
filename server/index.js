import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserAgent } from './browserAgent.js';
import { GroqAIService } from './groqService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Active sessions
const sessions = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  const sessionId = Date.now().toString();

  // Keep-alive ping/pong
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received message type: ${data.type}`);

      switch (data.type) {
        case 'init':
          await handleInit(ws, sessionId, data);
          break;
        case 'execute':
          await handleExecute(ws, sessionId, data);
          break;
        case 'stop':
          await handleStop(ws, sessionId);
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown command' }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      if (session.browserAgent) {
        session.browserAgent.close().catch(err => console.error('Error closing browser:', err));
      }
      sessions.delete(sessionId);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// WebSocket keep-alive interval
const keepAliveInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('Terminating inactive connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Every 30 seconds

wss.on('close', () => {
  clearInterval(keepAliveInterval);
});

async function handleInit(ws, sessionId, data) {
  try {
    const { apiKey } = data;

    if (!apiKey) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Groq API key is required'
      }));
      return;
    }

    const groqService = new GroqAIService(apiKey);
    const browserAgent = new BrowserAgent(groqService, ws);

    sessions.set(sessionId, {
      groqService,
      browserAgent
    });

    ws.send(JSON.stringify({
      type: 'init_success',
      sessionId
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to initialize: ' + error.message
    }));
  }
}

async function handleExecute(ws, sessionId, data) {
  const session = sessions.get(sessionId);

  if (!session) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Session not initialized'
    }));
    return;
  }

  const { task } = data;
  console.log(`Executing task: ${task}`);

  try {
    // Run task in background, don't await to prevent timeout
    session.browserAgent.executeTask(task).catch(error => {
      console.error('Task execution error:', error);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Task execution failed: ' + error.message
        }));
      }
    });
  } catch (error) {
    console.error('Error starting task:', error);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to start task: ' + error.message
      }));
    }
  }
}

async function handleStop(ws, sessionId) {
  const session = sessions.get(sessionId);

  if (session && session.browserAgent) {
    await session.browserAgent.stop();
    ws.send(JSON.stringify({
      type: 'stopped',
      message: 'Task execution stopped'
    }));
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`AGIfirst server running on port ${PORT}`);
});
