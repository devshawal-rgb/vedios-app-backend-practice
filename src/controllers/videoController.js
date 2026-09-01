import mongoose from 'mongoose';
import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { VideoService } from '../services/videoService.js';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { uploadToR2, deleteFromR2 } from '../services/r2Service.js';

export const getVideos = asyncWrapper(async (req, res) => {
  const { category, search, page, limit } = req.query;
  const data = await VideoService.getAllVideos({ category, search, page, limit });
  return ApiResponse.success(res, 'Videos fetched successfully', data);
});

export const getVideoById = asyncWrapper(async (req, res) => {
  const video = await VideoService.getVideoById(req.params.id);
  return ApiResponse.success(res, 'Video fetched successfully', video);
});

export const createVideo = asyncWrapper(async (req, res) => {
  const { title, description, category, tags } = req.body;

  let videoUrl = req.body.videoUrl;
  let thumbnailUrl = req.body.thumbnailUrl;

  // Handle uploaded files directly to Cloudflare R2
  if (req.files) {
    if (req.files.video && req.files.video[0]) {
      const vFile = req.files.video[0];
      videoUrl = await uploadToR2(vFile.path, vFile.originalname, vFile.mimetype, 'videos');
    }
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const tFile = req.files.thumbnail[0];
      thumbnailUrl = await uploadToR2(tFile.path, tFile.originalname, tFile.mimetype, 'thumbnails');
    }
  }

  if (!title || !category || !videoUrl) {
    return ApiResponse.error(res, 'Title, Category and Video File/URL are required', 400);
  }

  // Fallback thumbnail if not provided
  if (!thumbnailUrl) {
    thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
  }

  // Resolve category ID if passed as string name or ID
  let categoryId = category;
  if (!mongoose.Types.ObjectId.isValid(category)) {
    let catDoc = await Category.findOne({ name: category });
    if (!catDoc) {
      catDoc = await Category.create({ name: category });
    }
    categoryId = catDoc._id;
  }

  const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;

  // Fallback uploader ID if req.user is missing
  let uploaderId = req.user?._id;
  if (!uploaderId) {
    const defaultUser = await User.findOne();
    if (defaultUser) {
      uploaderId = defaultUser._id;
    } else {
      const newUser = await User.create({
        name: 'System Admin',
        email: 'admin@streampulse.io',
        password: 'adminpassword123',
        role: 'admin'
      });
      uploaderId = newUser._id;
    }
  }

  const video = await VideoService.createVideo({
    title,
    description,
    category: categoryId,
    videoUrl,
    thumbnailUrl,
    uploader: uploaderId,
    tags: parsedTags || []
  });

  return ApiResponse.success(res, 'Video created and stored successfully', video, 201);
});

export const updateVideo = asyncWrapper(async (req, res) => {
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
  const video = await VideoService.incrementViews(req.params.id);
  return ApiResponse.success(res, 'View recorded', { viewsCount: video ? video.viewsCount : 0 });
});

export const toggleLikeVideo = asyncWrapper(async (req, res) => {
  const result = await VideoService.toggleLike(req.params.id, req.user._id);
  return ApiResponse.success(res, result.isLiked ? 'Video liked' : 'Video unliked', result);
});

export const addVideoComment = asyncWrapper(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return ApiResponse.error(res, 'Comment text is required', 400);
  }

  const comment = await VideoService.addComment(req.params.id, req.user._id, text);
  return ApiResponse.success(res, 'Comment added', comment, 201);
});

export const getVideoComments = asyncWrapper(async (req, res) => {
  const comments = await VideoService.getVideoComments(req.params.id);
  return ApiResponse.success(res, 'Comments fetched', comments);
});
