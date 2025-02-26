import express from 'express';
import { processTransaction } from './services/transaction.service';
import { validateTransaction } from './validators/transaction.validator';
import { authMiddleware } from '@app/common';

const router = express.Router();

router.post('/', validateTransaction, authMiddleware, processTransaction);

export default router;