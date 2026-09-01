import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://devshawal_db_user:iDKbMuxueshsT1Xm@cluster0.yowtdbb.mongodb.net/video_app_db?retryWrites=true&w=majority';

// Set buffer timeout
mongoose.set('bufferTimeoutMS', 20000);

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4, // Force IPv4 to prevent Railway DNS/IPv6 timeout
      autoIndex: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Tip: Check MongoDB Atlas IP Whitelist (0.0.0.0/0) and credentials.`);
    throw error;
  }
};

/**
 * Ensures MongoDB is connected before running any database query
 */
export const ensureConnected = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
};

