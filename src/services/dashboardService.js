import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Category } from '../models/Category.js';

export class DashboardService {
  static async getAdminStats() {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalCategories = await Category.countDocuments();

    const viewsResult = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } }
    ]);
    const totalViews = viewsResult[0] ? viewsResult[0].totalViews : 0;

    const recentVideos = await Video.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      totalUsers,
      totalVideos,
      totalCategories,
      totalViews,
      recentVideos,
      recentUsers
    };
  }
}
