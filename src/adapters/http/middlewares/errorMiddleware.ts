import express, { Request, Response, NextFunction } from "express";

export const handleErrors = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err.stack);

    if (err instanceof Error && err.message) {
        res.status(400).json({ message: err.message });
    } else {
        res.status(500).json({ message: req.t("error.internal_server_error") });
    }
};

export const handleNotFound = (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    res.status(404).json({ message: req.t("error.not_found") });
};

export const applyErrorMiddleware = (app: express.Application) => {
    app.use(handleErrors);
    app.use(handleNotFound);
};