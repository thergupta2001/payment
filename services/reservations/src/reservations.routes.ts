import express from 'express';
import { validateReservation } from './validators/reservationValidator';
import { createReservation } from './services/createReservation.service';

const router = express.Router();

router.post("/reservations", validateReservation, createReservation);

export default router;
