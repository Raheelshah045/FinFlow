import mongoose from 'mongoose';
import { User } from './models.js';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name email username role -_id');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
};

testLogin();
