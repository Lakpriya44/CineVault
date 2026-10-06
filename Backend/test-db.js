import connectDB from './config/database.js';
import User from './models/User.js';

const testDatabase = async () => {
  await connectDB();

  const userCount = await User.countDocuments();

  console.log(`MongoDB connection successful.`);
  console.log(`Users currently in database: ${userCount}`);

  process.exit(0);
};

testDatabase();