import express from 'express';
import config from '../config/config';
import { connectDB } from '../adapters/database';
import { applyMiddlewares, applyErrorMiddleware } from '../adapters/http/middlewares';
import { applyRoutes } from '../adapters/http/routes';

const app = express();

connectDB().then(() => {
    applyMiddlewares(app);
    applyRoutes(app);
    applyErrorMiddleware(app);

    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
});