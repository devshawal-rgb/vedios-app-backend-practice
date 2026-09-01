import express from 'express';
import { getUsers, updateUserStatus } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.put('/:id/status', updateUserStatus);

export default router;
