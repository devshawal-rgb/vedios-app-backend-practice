import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { Category } from '../models/Category.js';

export const getCategories = asyncWrapper(async (req, res) => {
  const { type } = req.query;
  const filter = {};
  if (type) {
    filter.$or = [{ type: type }, { type: 'both' }, { type: { $exists: false } }];
  }
  const categories = await Category.find(filter).sort({ name: 1 });
  return ApiResponse.success(res, 'Categories fetched successfully', categories);
});

export const createCategory = asyncWrapper(async (req, res) => {
  const { name, description, icon, type = 'video' } = req.body;

  if (!name) {
    return ApiResponse.error(res, 'Category name is required', 400);
  }

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  if (existing) {
    return ApiResponse.error(res, 'Category with this name already exists', 400);
  }

  const category = await Category.create({
    name: name.trim(),
    type: ['video', 'document', 'both'].includes(type) ? type : 'video',
    description: description ? description.trim() : '',
    icon: icon || (type === 'document' ? 'file-text' : 'film')
  });

  return ApiResponse.success(res, 'Category created successfully', category, 201);
});

export const updateCategory = asyncWrapper(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }
  return ApiResponse.success(res, 'Category updated successfully', category);
});

export const deleteCategory = asyncWrapper(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }
  return ApiResponse.success(res, 'Category deleted successfully', null);
});
