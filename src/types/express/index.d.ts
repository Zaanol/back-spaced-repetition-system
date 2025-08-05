import { JwtPayload } from "jsonwebtoken";

export interface AuthUser extends JwtPayload {
    userId: string;
}

export {};

declare global {
    namespace Express {
        export interface Request {
            filters?: Record<string, any>;
            pagination?: {
                page: number;
                limit: number;
            };
            user?: AuthUser;
        }
    }
}