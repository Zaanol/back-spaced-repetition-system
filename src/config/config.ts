import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/your-database',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-jwt'
};