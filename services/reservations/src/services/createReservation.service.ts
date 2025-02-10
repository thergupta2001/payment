import { Response } from "express";
import { AuthenticatedRequest, CrudService } from "@app/common";
import Reservation from "../models/reservation.schema";
import mongoose from "mongoose";

const reservationService = new CrudService(Reservation);

export const createReservation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    req.body.userId = req.user.userId;
    req.body.invoiceId = new mongoose.Types.ObjectId();
    const reservation = await reservationService.create(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create reservation", error: err });
  }
};
