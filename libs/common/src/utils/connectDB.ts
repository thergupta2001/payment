import mongoose from "mongoose";

// let isConnected = false;

// export const connectDB = async (connection_string: string) => {
//   if (!isConnected) {
//     try {
//       await mongoose.connect(connection_string);
//       isConnected = true;
//       console.log("MongoDB connected successfully");
//     } catch (error) {
//       console.error("Failed to connect to MongoDB", error);
//       process.exit(1);
//     }
//   }
// };

// export const disconnectDB = async () => {
//   if (isConnected) {
//     await mongoose.disconnect();
//     isConnected = false;
//     console.log("MongoDB disconnected");
//   }
// };

// process.on("SIGINT", async () => {
//   await disconnectDB();
//   process.exit(0);
// });

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;
  private maxRetries = 3;
  private retryDelay = 5000;

  private constructor() {
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Already connected to the database");
      return;
    }
    // if (!this.isConnected) {
    //   try {
    //     await mongoose.connect(process.env.MONGODB_URI!);
    //     this.isConnected = true;
    //     console.log("MongoDB connected successfully");
    //   } catch (error) {
    //     console.error("Failed to connect to MongoDB", error);
    //     throw error;
    //   }
    // }

    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        await mongoose.connect(process.env.MONGODB_URI!);
        this.isConnected = true;
        console.log("MongoDB connected successfully");
        break;
      } catch (error) {
        attempts++;
        console.error(`Database connection attempt ${attempts} failed:`, error);
        if (attempts >= this.maxRetries) {
          console.error(
            "Max retry attempts reached. Could not connect to the database."
          );
          throw error;
        }
        await new Promise((res) => setTimeout(res, this.retryDelay));
      }
    }
    return;
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log("No active database connection");
      return;
    }
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("Database disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting from database:", error);
      throw error;
    }
  }
}

export default DatabaseConnection;
