import mongoose from "mongoose";

export const connectDB = async (connection_string: string) => {
  try {
    await mongoose.connect(connection_string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
