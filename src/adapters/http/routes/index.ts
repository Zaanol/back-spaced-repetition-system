import express from 'express';
import userRoutes from './userRoutes';

export const applyRoutes = (app: express.Application) => {
    app.use('/users', userRoutes);
};