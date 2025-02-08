import { Request, Response } from "express";
import { CrudService } from "@app/common";
import Reservation from "../models/reservation.schema";

const reservationService = new CrudService(Reservation);

export const createReservation = async (req: Request, res: Response) => {
    try {
        const reservation = await reservationService.create(req.body);
        res.status(201).json(reservation);
    } catch (err) {
        res.status(500).json({ message: "Failed to create reservation" });
        console.log(err);
    }
}