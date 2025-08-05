import express, { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../../infrastructure/security/jwt";
import { AuthUser } from "../../../types/express";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const publicRoutes = ["/users/register", "/users/login"];

    if (publicRoutes.includes(req.path)) {
        return next();
    }

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        
        verifyToken(token).then(
            (decoded) =>  {
                (req as any).user = decoded as AuthUser

                next();
            },
            () => {
                return res.status(401).json({ error: "Unauthorized" })
            }
        );
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const applyAuthMiddleware = (app: express.Application) => {
    app.use(authenticateJWT);
};