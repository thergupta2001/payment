import { Schema, Document, model, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  email: string;
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
    }
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
