const mongoose = require("mongoose");
const mongoMemory = require("mongodb-memory-server");

let db;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (process.env.VITEST) {
      db = await mongoMemory.MongoMemoryServer.create();
      uri = db.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

async function disconnectDB() {
  await mongoose.disconnect();
  if (db) db.stop();
}

process.on("SIGTERM", disconnectDB);
module.exports = { connectDB, disconnectDB };
