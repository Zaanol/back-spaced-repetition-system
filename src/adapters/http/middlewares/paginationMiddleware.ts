import { RequestHandler } from "express";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const paginationMiddleware: RequestHandler = (req, _res, next) => {
    const { page: pageStr, limit: limitStr, ...filters } = req.query;
    req.filters = filters;

    const page = Math.max(1, parseInt(pageStr as string) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, parseInt(limitStr as string) || DEFAULT_LIMIT);

    req.pagination = { page, limit };
    next();
};