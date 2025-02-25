import { Document, model, Schema, Types } from "mongoose";

interface IBalance extends Document {
  userId: Types.ObjectId;
  balance: number;
}

const balanceSchema = new Schema<IBalance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const Balance = model<IBalance>("Balance", balanceSchema);
export default Balance;
