import { Schema, Document, model, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  balance: number;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 2000,
    }
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
