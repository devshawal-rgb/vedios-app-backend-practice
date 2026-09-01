import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './models/Category.js';
import { Video } from './models/Video.js';
import { User } from './models/User.js';
import { Comment } from './models/Comment.js';
import { Like } from './models/Like.js';

dotenv.config();

const cleanDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected! Flushing all collections...');

    await Promise.all([
      Category.deleteMany({}),
      Video.deleteMany({}),
      User.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({})
    ]);

    console.log('✨ Database completely flushed! All collections wiped empty.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Flush Error:', err.message);
    process.exit(1);
  }
};

cleanDB();
