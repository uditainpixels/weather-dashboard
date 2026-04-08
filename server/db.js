import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const maskedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'undefined';
    console.log(`Connecting to MongoDB: ${maskedUri}`);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Server will continue running, but DB-related features (Auth, Favorites) will not work.');
  }
};

export default connectDB;
