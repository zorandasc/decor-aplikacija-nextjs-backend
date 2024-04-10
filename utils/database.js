import mongoose from "mongoose";

let isConnected = false; // track the connection

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "decorwood_test",
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    isConnected = true;
  } catch (error) {
    console.log("FROM DATABASE.JS", error);
  }
};
