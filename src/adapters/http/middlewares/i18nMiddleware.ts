import express, { Request, Response, NextFunction } from 'express';
import i18nextMiddleware from 'i18next-http-middleware';
import i18n from '../../../config/i18n';

export const applyI18nMiddleware = (app: express.Application) => {
    app.use(i18nextMiddleware.handle(i18n));

    //TODO It works, but is recommended to fix the capture of the languague from header
    app.use(enforceLanguageByHeader);
};

export const enforceLanguageByHeader = (req: Request, res: Response, next: NextFunction) => {
    const acceptLanguage = req.headers['accept-language'];

    if (acceptLanguage) {
        const preferredLanguage = acceptLanguage.split(',')[0];
        if (i18n.language !== preferredLanguage) {
            i18n.changeLanguage(preferredLanguage);
        }
    }

    next();
};