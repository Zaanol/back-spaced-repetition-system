import { NextFunction, Request, Response} from "express";
import { DeckService } from "../../../application/services/deckService";
import { catchAsync } from "./utils/utilsController";
import i18n from "../../../config/i18n";

export class DeckController {
    private deckService: DeckService;

    constructor(deckService: DeckService) {
        this.deckService = deckService;

        this.create = catchAsync(this.create.bind(this));
        this.getById = catchAsync(this.getById.bind(this));
        this.getAll = catchAsync(this.getAll.bind(this));
    }

    public async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const newDeck = await this.deckService.create(req.body);

        res.status(201).json(newDeck);
    }

    public async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const id = req.params.id as string;

        const deck = await this.deckService.getById(id);

        //TODO Transfer validation to repository
        if (!deck) {
            res.status(404).json({ error: i18n.t("deck.notFound") });
            return;
        }

        res.json(deck);
    }

    public async getAll(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const { filters, pagination } = req;

        const decks = await this.deckService.getAll(
            filters?.name?.toString(),
            filters?.description?.toString(),
            pagination?.page,
            pagination?.limit
        );

        res.json(decks);
    }
}