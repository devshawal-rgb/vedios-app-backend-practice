import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://devshawal_db_user:iDKbMuxueshsT1Xm@cluster0.yowtdbb.mongodb.net/video_app_db?retryWrites=true&w=majority';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Tip: Allow IP 0.0.0.0/0 in MongoDB Atlas -> Network Access tab.`);
  }
};
