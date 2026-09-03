import mongoose from 'mongoose';

const documentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a document category name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'file-text'
  }
}, { timestamps: true });

export const DocumentCategory = mongoose.model('DocumentCategory', documentCategorySchema);
