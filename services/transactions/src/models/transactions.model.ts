import { Document, model, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripePaymentId: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ stripePaymentId: 1 }, { unique: true }); 
transactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = model<ITransaction>("Transaction", transactionSchema);
export default Transaction;