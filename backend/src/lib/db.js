/**
 * Database Connection Helper for Serverless & Long-Running Environments
 * Ensures active MongoDB Mongoose connection without buffering timeouts.
 */
import mongoose from 'mongoose';

// Disable buffering globally so requests fail immediately if DB is unreachable
mongoose.set('bufferCommands', false);

let isConnected = false;

export async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI missing from environment variables');
    return;
  }

  try {
    const opts = {
      bufferCommands: false, // Prevents 10,000ms command buffering timeouts
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    await mongoose.connect(mongoUri, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ Mongoose connection failed:', err.message);
    // Reset connection state to allow retry on next request
    isConnected = false;
  }
}
