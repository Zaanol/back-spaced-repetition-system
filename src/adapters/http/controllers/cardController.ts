import { NextFunction, Request, Response } from "express";
import { CardService } from "../../../application/services/cardService";
import { catchAsync } from "./utils/utilsController";
import i18n from "../../../config/i18n";
import multer from "multer";

export class CardController {
    private cardService: CardService;
    private upload: multer.Multer;

    constructor(cardService: CardService) {
        this.cardService = cardService;
        this.upload = multer({ storage: multer.memoryStorage() });

        this.create = catchAsync(this.create.bind(this));
        this.getById = catchAsync(this.getById.bind(this));
        this.getAll = catchAsync(this.getAll.bind(this));
        this.update = catchAsync(this.update.bind(this));
        this.delete = catchAsync(this.delete.bind(this));
    }

    public async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const cardDTO = JSON.parse(req.body.card);
        const files = (req.files as Express.Multer.File[]).reduce((acc, file) => {
            if (!acc[file.fieldname]) acc[file.fieldname] = [];
            acc[file.fieldname].push(file);
            return acc;
        }, {} as { [key: string]: Express.Multer.File[] });

        cardDTO.userId = req.user?.id;

        const newCard = await this.cardService.create(cardDTO, files);
        res.status(201).json(newCard);
    }

    public async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const card = await this.cardService.getById(req.params.id);

        if (!card) {
            res.status(404).json({ error: i18n.t("card.notFound") });
            return;
        }

        res.json(card);
    }

    public async getAll(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const { filters, pagination } = req;

        const cards = await this.cardService.getAll(filters, pagination?.page, pagination?.limit);
        res.json(cards);
    }

    public async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const updatedCard = await this.cardService.update(req.params.id, req.body);
        res.json(updatedCard);
    }

    public async delete(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const success = await this.cardService.delete(req.params.id);
        res.status(success ? 204 : 404).send();
    }

    get uploadMiddleware() {
        return this.upload.any();
    }
}