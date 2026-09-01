import { Video } from '../models/Video.js';
import { Like } from '../models/Like.js';
import { Comment } from '../models/Comment.js';

export class VideoService {
  static async getAllVideos({ category, search, page = 1, limit = 10 }) {
    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const videos = await Video.find(query)
      .populate('category', 'name icon')
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Video.countDocuments(query);

    return {
      videos,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getVideoById(id) {
    const video = await Video.findById(id)
      .populate('category', 'name icon')
      .populate('uploader', 'name avatar');

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  }

  static async createVideo(videoData) {
    const video = await Video.create(videoData);
    return video;
  }

  static async incrementViews(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    return video;
  }

  static async toggleLike(videoId, userId) {
    const existingLike = await Like.findOne({ video: videoId, user: userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
      return { isLiked: false };
    } else {
      await Like.create({ video: videoId, user: userId });
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });
      return { isLiked: true };
    }
  }

  static async addComment(videoId, userId, text) {
    const comment = await Comment.create({
      video: videoId,
      user: userId,
      text
    });
    return comment.populate('user', 'name avatar');
  }

  static async getVideoComments(videoId) {
    return await Comment.find({ video: videoId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
  }
}
