import express from 'express';
import {
  getDocumentCategories,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory
} from '../controllers/documentCategoryController.js';

const router = express.Router();

router.route('/')
  .get(getDocumentCategories)
  .post(createDocumentCategory);

router.route('/:id')
  .put(updateDocumentCategory)
  .delete(deleteDocumentCategory);

export default router;
