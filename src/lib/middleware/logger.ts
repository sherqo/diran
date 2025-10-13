import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
    console.log(`🔍 ${req.method} ${req.path}`, {
        body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
        headers: req.headers['content-type'],
    });
    next();
};
