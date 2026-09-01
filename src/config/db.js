import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Tip: Allow IP 0.0.0.0/0 in MongoDB Atlas -> Network Access tab, or use local MongoDB Compass (mongodb://127.0.0.1:27017/video_app_db).`);
  }
};
