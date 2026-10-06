import { readFileSync } from 'node:fs';
import connectDB from './config/database.js';
import User from './models/User.js';

const migrateUsers = async () => {
  try {
    await connectDB();

    const users = JSON.parse(
      readFileSync(new URL('./users.json', import.meta.url), 'utf8')
    );

    console.log(`Found ${users.length} users in users.json`);

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        console.log(`Skipping existing user: ${user.email}`);
        continue;
      }

      await User.create({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt
      });

      console.log(`Migrated: ${user.email}`);
    }

    console.log('User migration completed.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
};

migrateUsers();