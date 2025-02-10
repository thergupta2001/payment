import express from 'express';
import { validateReservation } from './validators/reservationValidator';
import { createReservation } from './services/createReservation.service';
import { authMiddleware } from '@app/common/utils/auth.middleware';

const router = express.Router();

router.post("/reservations", validateReservation, authMiddleware, createReservation);

export default router;
