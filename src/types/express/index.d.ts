export {};

declare global {
    namespace Express {
        export interface Request {
            filters?: Record<string, any>;
            pagination?: {
                page: number;
                limit: number;
            };
        }
    }
}