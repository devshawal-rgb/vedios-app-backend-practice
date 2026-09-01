import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

export const getUsers = asyncWrapper(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return ApiResponse.success(res, 'Users fetched successfully', users);
});

export const updateUserStatus = asyncWrapper(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (role) user.role = role;

  await user.save();
  return ApiResponse.success(res, 'User status updated successfully', user);
});
