import mongoose from 'mongoose';
import { User } from './models.js';
import dotenv from 'dotenv';

dotenv.config();

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const oldEmail = '1@appadmin@gmail.com';
        const newEmail = '1stappadmin@gmail.com';

        // Find by old email or old username correctly
        let admin = await User.findOne({ email: oldEmail });

        if (!admin) {
            // Check if it already exists with new email
            admin = await User.findOne({ email: newEmail });
        }

        if (admin) {
            admin.email = newEmail;
            admin.username = '1stappadmin'; // Cleaner username too
            admin.password = 'Syed23072006';
            await admin.save();
            console.log('Admin updated successfully to 1stappadmin@gmail.com!');
        } else {
            // Create fresh if not found
            const newAdmin = new User({
                name: 'App Admin',
                email: newEmail,
                username: '1stappadmin',
                password: 'Syed23072006',
                phone: 'N/A',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('New Admin user created: 1stappadmin@gmail.com');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

updateAdmin();
