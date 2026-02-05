import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("MONGO_URI"); // 🔍 DEBUG

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected ✅`);
  } catch (error) {
    console.error("MongoDB connection failed ❌:", error);
    process.exit(1);
  }
};
