import mongoose, { Schema, Document } from "mongoose";

interface IReservation extends Document {
  // userId: mongoose.Types.ObjectId;
  // invoiceId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: "booked" | "cancelled" | "completed";
}

const reservationSchema = new Schema<IReservation>(
  {
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value: Date): boolean => value >= new Date(),
        message: "Start date must be in the future.",
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IReservation, value: Date): boolean {
          return this.startDate < value;
        },
        message: "End date must be after the start date.",
      },
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index(
  { startDate: 1, endDate: 1 },
);

const Reservation = mongoose.model<IReservation>(
  "Reservation",
  reservationSchema
);

export default Reservation;

// userId: {
//   type: Schema.Types.ObjectId,
//   ref: "User",
//   required: true,
//   index: true,
// },
// invoiceId: {
//   type: Schema.Types.ObjectId,
//   ref: "Invoice",
//   required: true,
//   unique: true,
// },