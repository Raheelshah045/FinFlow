import mongoose from 'mongoose';
import { User } from './models.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const fixPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas to check users...');

        const users = await User.find({});
        console.log(`Found ${users.length} users in the database.`);

        for (const user of users) {
            console.log(`- User: ${user.username} (${user.email}) | Role: ${user.role}`);

            // If this is the admin we want to fix
            if (user.email === '1stappadmin@gmail.com') {
                user.password = 'Raheel1209'; // This will be hashed by the pre-save hook
                await user.save();
                console.log(`   🚀 Updated password for 1stappadmin@gmail.com to: Raheel1209`);
            }
        }

        console.log('\n✅ All updates completed.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
};

fixPasswords();
