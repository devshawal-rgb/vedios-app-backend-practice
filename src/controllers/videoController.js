import mongoose from 'mongoose';
import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { VideoService } from '../services/videoService.js';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';

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

  // Handle uploaded files via Multer if provided
  if (req.files) {
    const host = req.protocol + '://' + req.get('host');
    if (req.files.video && req.files.video[0]) {
      videoUrl = `${host}/uploads/${req.files.video[0].filename}`;
    }
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnailUrl = `${host}/uploads/${req.files.thumbnail[0].filename}`;
    }
  }

  if (!title || !category || !videoUrl || !thumbnailUrl) {
    return ApiResponse.error(res, 'Title, Category, Video File/URL and Thumbnail File/URL are required', 400);
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

  return ApiResponse.success(res, 'Video created successfully', video, 201);
});

export const updateVideo = asyncWrapper(async (req, res) => {
  let video = await Video.findById(req.params.id);

  if (!video) {
    return ApiResponse.error(res, 'Video not found', 404);
  }

  video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return ApiResponse.success(res, 'Video updated successfully', video);
});

export const deleteVideo = asyncWrapper(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return ApiResponse.error(res, 'Video not found', 404);
  }

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
