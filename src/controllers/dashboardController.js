import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { DashboardService } from '../services/dashboardService.js';
import { Category } from '../models/Category.js';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';
import { Like } from '../models/Like.js';

export const getStats = asyncWrapper(async (req, res) => {
  const stats = await DashboardService.getAdminStats();
  return ApiResponse.success(res, 'Admin dashboard stats fetched successfully', stats);
});

export const flushDatabase = asyncWrapper(async (req, res) => {
  await Promise.all([
    Category.deleteMany({}),
    Video.deleteMany({}),
    User.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({})
  ]);
  return ApiResponse.success(res, 'Database completely flushed! All seed data and collections wiped.');
});
