import express from "express";
import cors from "cors";

export const applyCorsMiddleware = (app: express.Application) => {
    app.use(cors());
};