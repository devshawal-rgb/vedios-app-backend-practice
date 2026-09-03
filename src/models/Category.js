import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'document', 'both'],
    default: 'video'
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'code'
  }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
