import express from 'express';
import userRoutes from './userRoutes';
import deckRoutes from './deckRoutes';
import cardRoutes from './cardRoutes';
import mediaRoutes from './mediaRoutes';

export const applyRoutes = (app: express.Application) => {
    app.use('/users', userRoutes);
    app.use('/decks', deckRoutes);
    app.use('/cards', cardRoutes);
    app.use('/medias', mediaRoutes);
};