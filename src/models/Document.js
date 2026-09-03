import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a document title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide document file URL']
  },
  fileName: {
    type: String,
    required: [true, 'Please provide original file name']
  },
  fileType: {
    type: String,
    default: 'pdf',
    lowercase: true,
    trim: true
  },
  fileSize: {
    type: Number,
    default: 0 // Size in bytes
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentCategory',
    required: false
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);
