import express from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  deleteDocument,
  recordDownload
} from '../controllers/documentController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDocuments)
  .post(
    upload.fields([
      { name: 'document', maxCount: 1 },
      { name: 'file', maxCount: 1 }
    ]),
    createDocument
  );

router.route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

router.post('/:id/download', recordDownload);

export default router;
