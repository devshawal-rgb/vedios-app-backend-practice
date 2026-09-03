import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { DocumentCategory } from '../models/DocumentCategory.js';
import { ensureConnected } from '../config/db.js';

export const getDocumentCategories = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const categories = await DocumentCategory.find().sort({ name: 1 });
  return ApiResponse.success(res, 'Document categories fetched successfully', categories);
});

export const createDocumentCategory = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const { name, description, icon } = req.body;

  if (!name) {
    return ApiResponse.error(res, 'Document category name is required', 400);
  }

  const existing = await DocumentCategory.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
  });

  if (existing) {
    return ApiResponse.error(res, 'Document category with this name already exists', 400);
  }

  const docCategory = await DocumentCategory.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    icon: icon || 'file-text'
  });

  return ApiResponse.success(res, 'Document category created in separate collection successfully', docCategory, 201);
});

export const updateDocumentCategory = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const category = await DocumentCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return ApiResponse.error(res, 'Document category not found', 404);
  }

  return ApiResponse.success(res, 'Document category updated successfully', category);
});

export const deleteDocumentCategory = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const category = await DocumentCategory.findByIdAndDelete(req.params.id);

  if (!category) {
    return ApiResponse.error(res, 'Document category not found', 404);
  }

  return ApiResponse.success(res, 'Document category deleted successfully from MongoDB', null);
});
