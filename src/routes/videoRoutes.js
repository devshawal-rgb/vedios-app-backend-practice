import express from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  recordView,
  toggleLikeVideo,
  addVideoComment,
  getVideoComments
} from '../controllers/videoController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getVideos)
  .post(
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    createVideo
  );

router.route('/:id')
  .get(getVideoById)
  .put(protect, updateVideo)
  .delete(deleteVideo);

router.post('/:id/view', recordView);
router.post('/:id/like', protect, toggleLikeVideo);

router.route('/:id/comments')
  .get(getVideoComments)
  .post(protect, addVideoComment);

export default router;
