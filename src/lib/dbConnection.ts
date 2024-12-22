import mongoose from "mongoose";

export async function connectToDatabase() {
  const db = (await mongoose.connect(process.env.MONGODB_URI as string)).connection;

  db.on('error', console.error.bind(console, 'connection error'));

  db.once('open', function() {
    console.log('Connected to DB')
  })

  return db;
}