import express from "express";
import { applyAuthMiddleware } from "./authMiddleware";
import { applyErrorMiddleware } from "./errorMiddleware";
import { applyI18nMiddleware } from "./i18nMiddleware";
import { applyCorsMiddleware } from "./corsMiddleware";

export const applyMiddlewares = (app: express.Application) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    applyCorsMiddleware(app);
    applyI18nMiddleware(app);
    applyAuthMiddleware(app);
};

export { applyErrorMiddleware };