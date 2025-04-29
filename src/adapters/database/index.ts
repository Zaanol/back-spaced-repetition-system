import { connectDBMoongose } from './mongoose';

export const connectDB = async () => {
    await connectDBMoongose();
};