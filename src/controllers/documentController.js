import mongoose from 'mongoose';
import path from 'path';
import { asyncWrapper } from '../utils/asyncWrapper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { Document } from '../models/Document.js';
import { DocumentCategory } from '../models/DocumentCategory.js';
import { User } from '../models/User.js';
import { uploadToR2, deleteFromR2 } from '../services/r2Service.js';
import { ensureConnected } from '../config/db.js';

export const getDocuments = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const { category, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = category;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Document.countDocuments(query);
  const documents = await Document.find(query)
    .populate('category', 'name icon')
    .populate('uploader', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return ApiResponse.success(res, 'Documents fetched successfully', {
    documents,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

export const getDocumentById = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const doc = await Document.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('uploader', 'name email avatar');

  if (!doc) {
    return ApiResponse.error(res, 'Document not found', 404);
  }

  return ApiResponse.success(res, 'Document fetched successfully', doc);
});

export const createDocument = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const { title, description, category, tags } = req.body;

  let fileUrl = req.body.fileUrl;
  let fileName = req.body.fileName || 'document.pdf';
  let fileSize = req.body.fileSize || 0;
  let mimeType = req.body.mimeType || 'application/pdf';
  let fileType = 'pdf';

  // Handle uploaded document file directly to Cloudflare R2
  if (req.files && req.files.document && req.files.document[0]) {
    const docFile = req.files.document[0];
    fileName = docFile.originalname;
    fileSize = docFile.size;
    mimeType = docFile.mimetype;
    
    // Extract extension (e.g. pdf, docx, xlsx, pptx, txt)
    const ext = path.extname(docFile.originalname).toLowerCase().replace('.', '');
    fileType = ext || 'pdf';

    console.log(`[R2 Document Upload] Uploading: ${fileName} (${fileSize} bytes, type: ${fileType})`);
    fileUrl = await uploadToR2(docFile.path, fileName, mimeType, 'documents');
    console.log(`[R2 Document Upload Success] CDN URL: ${fileUrl}`);
  }

  if (!title || !fileUrl) {
    return ApiResponse.error(res, 'Title and Document File/URL are required', 400);
  }

  // Resolve document category if provided
  let categoryId = null;
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    const existingCat = await DocumentCategory.findById(category);
    if (existingCat) {
      categoryId = existingCat._id;
    }
  }

  if (!categoryId && category && typeof category === 'string' && category.trim() !== '') {
    let catDoc = await DocumentCategory.findOne({ name: { $regex: new RegExp(`^${category.trim()}$`, 'i') } });
    if (!catDoc) {
      catDoc = await DocumentCategory.create({ name: category.trim(), icon: 'file-text' });
    }
    categoryId = catDoc._id;
  }

  // Parse tags
  const parsedTags = typeof tags === 'string'
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : (Array.isArray(tags) ? tags : []);

  // Resolve uploader
  let uploaderId = req.user?._id;
  if (!uploaderId) {
    let defaultUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    if (defaultUser) {
      uploaderId = defaultUser._id;
    }
  }

  const document = await Document.create({
    title,
    description: description || '',
    fileUrl,
    fileName,
    fileType,
    fileSize,
    mimeType,
    category: categoryId,
    uploader: uploaderId,
    tags: parsedTags
  });

  const populatedDoc = await Document.findById(document._id)
    .populate('category', 'name icon')
    .populate('uploader', 'name email avatar');

  console.log(`✅ [MongoDB Document Success] Document record created with ID: ${document._id}`);

  return ApiResponse.success(res, 'Document uploaded to Cloudflare R2 and saved to MongoDB successfully', populatedDoc, 201);
});

export const deleteDocument = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const doc = await Document.findById(req.params.id);

  if (!doc) {
    return ApiResponse.error(res, 'Document not found', 404);
  }

  // Delete from Cloudflare R2 if it exists
  if (doc.fileUrl) {
    await deleteFromR2(doc.fileUrl);
  }

  await doc.deleteOne();
  return ApiResponse.success(res, 'Document deleted successfully from MongoDB & Cloudflare R2', null);
});

export const recordDownload = asyncWrapper(async (req, res) => {
  await ensureConnected();
  const doc = await Document.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (!doc) {
    return ApiResponse.error(res, 'Document not found', 404);
  }

  return ApiResponse.success(res, 'Download count updated', {
    downloadCount: doc.downloadCount,
    fileUrl: doc.fileUrl
  });
});
