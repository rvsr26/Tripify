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

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, { cors:{ origin: '*' }});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(socketMiddleware(io));

// Swagger
try {
  const swaggerPath = path.join(process.cwd(), 'docs', 'swagger.yaml');
  const swaggerDoc = YAML.load(swaggerPath);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (err) {
  console.error('❌ Failed to load Swagger:', err.message);
}

// Routes
app.use('/api', apiRouter);

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
