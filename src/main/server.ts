import express from 'express';
import config from '../config/config';
import { connectDB } from '../adapters/database';
import { applyMiddlewares, applyErrorMiddleware } from '../adapters/http/middlewares';
import { applyRoutes } from '../adapters/http/routes';

const app = express();
let dbConnectionPromise: Promise<void> | null = null;

applyMiddlewares(app);
applyRoutes(app);
applyErrorMiddleware(app);

const ensureDbConnected = async (): Promise<void> => {
    if (!dbConnectionPromise) {
        dbConnectionPromise = connectDB();
    }

    await dbConnectionPromise;
};

void ensureDbConnected().catch((error) => {
    console.error('Error connecting to MongoDB:', error?.message ?? error);
});

if (require.main === module) {
    ensureDbConnected()
        .then(() => {
            app.listen(config.port, () => {
                console.log(`Server is running on port ${config.port}`);
            });
        })
        .catch((error) => {
            console.error('Failed to start server:', error?.message ?? error);
            process.exit(1);
        });
}

export { app, ensureDbConnected };
export default app;
