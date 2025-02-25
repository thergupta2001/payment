import express from 'express';
import { processTransaction } from './services/transaction.service';
import { validateTransaction } from './validators/transaction.validator';

const router = express.Router();

router.post('/', validateTransaction, processTransaction);

export default router;