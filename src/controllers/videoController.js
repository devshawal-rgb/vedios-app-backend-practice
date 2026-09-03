import mongoose from 'mongoose';
import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { VideoService } from '../services/videoService.js';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { uploadToR2, deleteFromR2 } from '../services/r2Service.js';
import { ensureConnected } from '../config/db.js';

export const getVideos = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const { category, search, page, limit } = req.query;
  const data = await VideoService.getAllVideos({ category, search, page, limit });
  return ApiResponse.success(res, 'Videos fetched successfully', data);
});

export const getVideoById = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const video = await VideoService.getVideoById(req.params.id);
  return ApiResponse.success(res, 'Video fetched successfully', video);
});

export const createVideo = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const { title, description, category, tags } = req.body;

  let videoUrl = req.body.videoUrl;
  let thumbnailUrl = req.body.thumbnailUrl;

  // Handle uploaded files directly to Cloudflare R2
  if (req.files) {
    if (req.files.video && req.files.video[0]) {
      const vFile = req.files.video[0];
      console.log(`[R2 Upload] Uploading video file: ${vFile.originalname} (${vFile.size} bytes)`);
      videoUrl = await uploadToR2(vFile.path, vFile.originalname, vFile.mimetype, 'videos');
      console.log(`[R2 Upload Success] Video CDN URL: ${videoUrl}`);
    }
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const tFile = req.files.thumbnail[0];
      console.log(`[R2 Upload] Uploading thumbnail file: ${tFile.originalname}`);
      thumbnailUrl = await uploadToR2(tFile.path, tFile.originalname, tFile.mimetype, 'thumbnails');
      console.log(`[R2 Upload Success] Thumbnail CDN URL: ${thumbnailUrl}`);
    }
  }

  if (!title || !videoUrl) {
    return ApiResponse.error(res, 'Title and Video File/URL are required', 400);
  }

  // Fallback thumbnail if not provided
  if (!thumbnailUrl) {
    thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
  }

  // Safe category resolution: Always ensure a valid existing Category in MongoDB
  let categoryId = null;
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    const existingCat = await Category.findById(category);
    if (existingCat) {
      categoryId = existingCat._id;
    }
  }

  if (!categoryId && category && typeof category === 'string' && category.trim() !== '') {
    let catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category.trim()}$`, 'i') } });
    if (!catDoc) {
      catDoc = await Category.create({ name: category.trim(), icon: 'film' });
      console.log(`[DB] Created new category: ${catDoc.name} (${catDoc._id})`);
    }
    categoryId = catDoc._id;
  }

  if (!categoryId) {
    let fallbackCat = await Category.findOne();
    if (!fallbackCat) {
      fallbackCat = await Category.create({ name: 'General', description: 'General Videos', icon: 'film' });
      console.log(`[DB] Created default 'General' category: ${fallbackCat._id}`);
    }
    categoryId = fallbackCat._id;
  }

  const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(tags) ? tags : []);

  // Safe uploader resolution: Always ensure a valid existing User in MongoDB
  let uploaderId = req.user?._id;
  if (!uploaderId) {
    let defaultUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'System Admin',
        email: 'admin@streampulse.io',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log(`[DB] Created default admin user: ${defaultUser._id}`);
    }
    uploaderId = defaultUser._id;
  }

  console.log(`[MongoDB] Saving video record to MongoDB: "${title}" [Category: ${categoryId}, Uploader: ${uploaderId}]`);

  const video = await VideoService.createVideo({
    title,
    description: description || '',
    category: categoryId,
    videoUrl,
    thumbnailUrl,
    uploader: uploaderId,
    tags: parsedTags || []
  });

  console.log(`✅ [MongoDB Success] Video saved successfully with ID: ${video._id}`);

  return ApiResponse.success(res, 'Video created and stored successfully in MongoDB & Cloudflare R2', video, 201);
});

export const updateVideo = asyncWrapper(async (req, res) => {
  await ensureConnected();
  let video = await Video.findById(req.params.id);

  if (!video) {
    return ApiResponse.error(res, 'Video not found', 404);
  }

  // If new files uploaded, upload to Cloudflare R2
  if (req.files) {
    if (req.files.video && req.files.video[0]) {
      const vFile = req.files.video[0];
      req.body.videoUrl = await uploadToR2(vFile.path, vFile.originalname, vFile.mimetype, 'videos');
    }
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const tFile = req.files.thumbnail[0];
      req.body.thumbnailUrl = await uploadToR2(tFile.path, tFile.originalname, tFile.mimetype, 'thumbnails');
    }
  }

  video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return ApiResponse.success(res, 'Video updated successfully', video);
});

export const deleteVideo = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const video = await Video.findById(req.params.id);

  if (!video) {
    return ApiResponse.error(res, 'Video not found', 404);
  }

  // Clean up from Cloudflare R2 if it's hosted there
  if (video.videoUrl) await deleteFromR2(video.videoUrl);
  if (video.thumbnailUrl) await deleteFromR2(video.thumbnailUrl);

  await video.deleteOne();
  return ApiResponse.success(res, 'Video deleted successfully', null);
});

export const recordView = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const video = await VideoService.incrementViews(req.params.id);
  return ApiResponse.success(res, 'View recorded', { viewsCount: video ? video.viewsCount : 0 });
});

export const toggleLikeVideo = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const result = await VideoService.toggleLike(req.params.id, req.user._id);
  return ApiResponse.success(res, result.isLiked ? 'Video liked' : 'Video unliked', result);
});

export const addVideoComment = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const { text } = req.body;
  if (!text) {
    return ApiResponse.error(res, 'Comment text is required', 400);
  }

  const comment = await VideoService.addComment(req.params.id, req.user._id, text);
  return ApiResponse.success(res, 'Comment added', comment, 201);
});

export const getVideoComments = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const comments = await VideoService.getVideoComments(req.params.id);
  return ApiResponse.success(res, 'Comments fetched', comments);
});
