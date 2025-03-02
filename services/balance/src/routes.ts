import express from 'express';
import { authMiddleware } from '@app/common';
import { validateUserId } from './validators/userIdValidator';
import { getBalance } from './services/getBalance.service';

const router = express.Router();

router.get("/balance/:id", validateUserId, authMiddleware, getBalance);

export default router;