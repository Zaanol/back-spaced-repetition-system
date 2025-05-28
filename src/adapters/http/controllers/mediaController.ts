import { NextFunction, Request, Response } from "express";
import { MediaService } from "../../../application/services/mediaService";
import { catchAsync } from "./utils/utilsController";

export class MediaController {
    private mediaService: MediaService;

    constructor(cardService: MediaService) {
        this.mediaService = cardService;

        this.getById = catchAsync(this.getById.bind(this));
    }

    public async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
        try {
            await this.mediaService.getById(req.params.id, res);
        } catch (error) {
            console.error('MediaBlock error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}