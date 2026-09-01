import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { Video } from './models/Video.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('🌱 Database already contains data, skipping auto-seed.');
      return;
    }

    console.log('🌱 Seeding initial database with sample categories, users, and videos...');

    // 1. Create Admin & User
    let admin = await User.findOne({ email: 'admin@streampulse.io' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@streampulse.io',
        password: 'adminpassword123',
        role: 'admin'
      });
    }

    let sampleUser = await User.findOne({ email: 'user@example.com' });
    if (!sampleUser) {
      sampleUser = await User.create({
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
    }

    // 2. Create Categories
    const techCat = await Category.create({ name: 'Technology', description: 'Tech & Development videos', icon: 'code' });
    const musicCat = await Category.create({ name: 'Music', description: 'Songs & Chill beats', icon: 'music_note' });
    const entertainmentCat = await Category.create({ name: 'Entertainment', description: 'Fun & Movies', icon: 'movie' });
    const eduCat = await Category.create({ name: 'Education', description: 'Learning & Tutorials', icon: 'school' });

    // 3. Create Sample Videos
    await Video.create([
      {
        title: 'Flutter & Node.js Fullstack Video Streaming Tutorial',
        description: 'Learn how to build a complete full-stack video application with Flutter frontend and Node.js MongoDB backend.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        category: techCat._id,
        uploader: admin._id,
        viewsCount: 1420,
        likesCount: 98,
        isPublished: true,
        tags: ['flutter', 'nodejs', 'mongodb', 'tutorial']
      },
      {
        title: 'Lofi Chill Beats - Relaxing Music Stream',
        description: 'Deep focus and chill lofi hip hop beats for studying, relaxing, and coding.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        category: musicCat._id,
        uploader: sampleUser._id,
        viewsCount: 5240,
        likesCount: 430,
        isPublished: true,
        tags: ['lofi', 'music', 'chill']
      },
      {
        title: 'Tears of Steel 4K HDR Sci-Fi Short Movie',
        description: 'VFX open-source sci-fi short film demonstration with high definition audio and visuals.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
        category: entertainmentCat._id,
        uploader: admin._id,
        viewsCount: 8910,
        likesCount: 720,
        isPublished: true,
        tags: ['movie', 'scifi', '4k']
      },
      {
        title: 'Complete Mobile App Architecture Guide 2026',
        description: 'Master clean architecture, MVVM state management with Provider, and robust API error handling.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
        category: eduCat._id,
        uploader: admin._id,
        viewsCount: 3100,
        likesCount: 215,
        isPublished: true,
        tags: ['architecture', 'flutter', 'education']
      }
    ]);

    console.log('✅ Initial database seed completed successfully!');
  } catch (err) {
    console.error('❌ Database Seed Error:', err.message);
  }
};
