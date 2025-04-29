import express from 'express';
import { applyAuthMiddleware } from './authMiddleware';
import { applyErrorMiddleware } from './errorMiddleware';
import { applyI18nMiddleware } from './i18nMiddleware';

export const applyMiddlewares = (app: express.Application) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    applyI18nMiddleware(app);
    applyAuthMiddleware(app);
};

export { applyErrorMiddleware };