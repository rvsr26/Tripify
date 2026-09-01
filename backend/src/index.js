import express from 'express';
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import mongoose from 'mongoose';
import { initQueues } from './lib/queues.js';
import apiRouter from './routes/api.js';
import { initSocket } from './lib/socket.js';
import { socketMiddleware } from './middlewares/socket.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { initFirebase } from './services/firebase.js';

// ── MCP Layer ──
import { createMcpServer }       from './mcp/server.js';
import { registerMcpTransports } from './mcp/transport.js';
import { mcpAuthMiddleware }     from './mcp/auth.js';

// ── Streaming + Orchestrator ──
import streamRouter       from './routes/stream.js';
import orchestratorRouter from './routes/orchestrator.js';

// ── Security + Performance ──
import rateLimit from 'express-rate-limit';
import { applySecurityHeaders } from './middlewares/security.js';
import { appCache } from './lib/cache.js';

const app = express();
const httpServer = createServer(app);

// Allow configurable CORS origin for Railway + Vercel split deployment
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim());
const io = new IOServer(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(socketMiddleware(io));

// ── Global Rate Limiter (lenient — per-route limits added below) ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
app.use('/api', globalLimiter);

// ── Auth Rate Limiter (strict) ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts.' },
});
app.use('/api/auth', authLimiter);

// ── AI Rate Limiter (cost protection) ──
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.AI_RATE_LIMIT || '30'),
  message: { error: 'AI rate limit reached. Please wait before generating another trip.' },
});
app.use('/api/planner/options', aiLimiter);
app.use('/api/planner/select',  aiLimiter);
app.use('/api/mcp',             aiLimiter);

// Swagger
try {
  const swaggerPath = path.join(process.cwd(), 'docs', 'swagger.yaml');
  const swaggerDoc = YAML.load(swaggerPath);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (err) {
  console.error('❌ Failed to load Swagger:', err.message);
}

import { connectDB } from './lib/db.js';

// ── Vercel Route Prefix Normalizer ──
app.use((req, res, next) => {
  if (req.url.startsWith('/_/backend')) {
    req.url = req.url.replace('/_/backend', '');
  }
  next();
});

// ── Database Connection Middleware ──
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.url.startsWith('/api')) {
    try { await connectDB(); } catch { /* ignore */ }
  }
  next();
});

// ── Existing REST API routes (unchanged) ──
app.use('/api', apiRouter);

// ── Streaming (SSE) Orchestrator route ──
app.use('/api/stream', streamRouter);
app.use('/api/orchestrate', orchestratorRouter);

// ── MCP Routes ──
app.use('/api', mcpAuthMiddleware); // attach mcpUserId to req
const mcpRouter = express.Router();
const mcpServer = createMcpServer();
registerMcpTransports(mcpRouter, mcpServer);
app.use('/api', mcpRouter);

// Health & Diagnostics
app.get('/api/health', (req,res)=> res.json({status:'ok', env: process.env.NODE_ENV || 'dev'}));
app.get('/api/diag', (req, res) => {
  const required = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GEMINI_API_KEY'];
  const status = {};
  required.forEach(k => {
    status[k] = process.env[k] ? '✅ DEFINED' : '❌ MISSING';
  });
  res.json({ status, node_env: process.env.NODE_ENV });
});

// DB connect and start
const PORT = process.env.PORT || 4000;
async function start(){
  console.log('--- STARTING TRIPIFY BACKEND ---');
  console.log('Checking critical env vars...');
  if (!process.env.MONGO_URI) console.error('CRITICAL: MONGO_URI is missing!');
  if (!process.env.JWT_SECRET) console.error('CRITICAL: JWT_SECRET is missing!');

  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, { 
        keepAlive: true,
        connectTimeoutMS: 10000 // 10s timeout
      });
      console.log('✅ Mongo connected');
    } else {
      console.error('❌ Skipping Mongo connection: URI not found');
    }
  } catch (err) {
    console.error('❌ Mongo connection failed:', err.message);
  }

  try {
    initQueues(); // bullmq init
    if (!process.env.VERCEL) {
      initSocket(io); // socket handlers
    } else {
      console.log('⚠️ Running on Vercel - WebSockets (Socket.io) disabled');
    }
    initFirebase(); // firebase initialization
  } catch (err) {
    console.error('❌ Service initialization error:', err);
  }

  // Only listen if NOT on Vercel (Vercel handles the server start automatically)
  if (!process.env.VERCEL) {
    httpServer.listen(PORT, () => console.log(`🚀 Tripify Backend listening on ${PORT}`));
  } else {
    console.log('✅ App ready for Vercel Serverless Invocation');
  }
}

start().catch(err => {
  console.error('🔥 Fatal boot error:', err);
});

// Export the app for Vercel
export default app;
// trigger nodemon restart
// trigger nodemon restart 2
