import { NextFunction, Request, Response } from "express";
import { catchAsync } from "./utils/utilsController";
import i18n from "../../../config/i18n";
import { SessionReviewService } from "../../../application/services/sessionReviewService";

export class SessionReviewController {
    private sessionReviewService: SessionReviewService;

    constructor(sessionReviewService: SessionReviewService) {
        this.sessionReviewService = sessionReviewService;

        this.create = catchAsync(this.create.bind(this));
        this.getById = catchAsync(this.getById.bind(this));
        this.getAll = catchAsync(this.getAll.bind(this));
    }

    public async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const newSession = await this.sessionReviewService.create(req.body, req.user?.userId);
        res.status(201).json(newSession);
    }

    public async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const sessionReview = await this.sessionReviewService.getById(req.params.id);

        if (!sessionReview) {
            res.status(404).json({ error: i18n.t("sessionReview.notFound") }); //TODO Create I18n
            return;
        }

        res.json(sessionReview);
    }

    public async getAll(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const { pagination } = req;

        const filters = {
            ...req.filters,
            userId: req.user?.userId
        };

        const reviews = await this.sessionReviewService.getAll(filters, pagination?.page, pagination?.limit);
        res.json(reviews);
    }
}