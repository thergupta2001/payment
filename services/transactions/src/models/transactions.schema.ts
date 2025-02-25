import { Document, model, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

const transactionSchema = new Schema<ITransaction>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
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

transactionSchema.index({ senderId: 1, createdAt: -1 });
transactionSchema.index({ receiverId: 1, createdAt: -1 });

const Transaction = model<ITransaction>("Transaction", transactionSchema);
export default Transaction;