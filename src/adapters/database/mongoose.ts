import mongoose from 'mongoose';
import config from '../../config/config';

export const connectDBMoongose = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    try {
        console.log('Connecting to database...');
        await mongoose.connect(config.mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
};
