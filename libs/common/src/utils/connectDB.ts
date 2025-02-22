import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async (connection_string: string) => {
  if (!isConnected) {
    try {
      await mongoose.connect(connection_string);
      isConnected = true;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB", error);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected");
  }
};

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});