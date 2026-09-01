import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthService } from '../services/authService.js';

export const register = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return ApiResponse.error(res, 'Please provide name, email, and password', 400);
  }

  const result = await AuthService.registerUser({ name, email, password, role });
  return ApiResponse.success(res, 'User registered successfully', result, 201);
});

export const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, 'Please provide email and password', 400);
  }

  const result = await AuthService.loginUser({ email, password });
  return ApiResponse.success(res, 'Logged in successfully', result, 200);
});

export const getMe = asyncWrapper(async (req, res) => {
  return ApiResponse.success(res, 'Current user retrieved successfully', req.user, 200);
});
