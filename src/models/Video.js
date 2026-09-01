import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a video title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    required: [true, 'Please provide video file URL']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Please provide thumbnail image URL']
  },
  duration: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }]
}, { timestamps: true });

export const Video = mongoose.model('Video', videoSchema);
