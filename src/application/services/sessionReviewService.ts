import { SessionReviewRepository } from "../../infrastructure/repositories/sessionReviewRepository";
import {CreateSessionReviewDT, SessionReviewDTO} from "../dtos/sessionReviewDTO";
import { SessionReview } from "../../domain/models/sessionReview";
import i18n from "../../config/i18n";
import { FilterQuery } from "mongoose";
import { DeckRepository } from "../../infrastructure/repositories/deckRepository";
import {PaginatedResult} from "../../infrastructure/repositories/baseRepository";

//TODO Implement translations
export class SessionReviewService {
    private sessionReviewRepository: SessionReviewRepository;
    private deckRepository: DeckRepository;

    constructor(sessionReviewRepository: SessionReviewRepository, deckRepository: DeckRepository) {
        this.sessionReviewRepository = sessionReviewRepository;
        this.deckRepository = deckRepository;
    }

    public async create(sessionReviewDTO: CreateSessionReviewDT, userId: string): Promise<SessionReview> {
        if (!await this.deckRepository.existsDeckById(sessionReviewDTO.deckId)) {
            throw new Error(i18n.t("deck.notFound"));
        }

        return await this.sessionReviewRepository.createSessionReview({
            ...sessionReviewDTO,
            userId,
            cardIds: []
        });
    }

    public async getById(id: string): Promise<SessionReview | null> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        
        return await this.sessionReviewRepository.findSessionReviewById(id);
    }
    
    public async getAll(
        filters: FilterQuery<SessionReview> = {},
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResult<SessionReview>> {
        return await this.sessionReviewRepository.findAllPaginated(
            filters,
            { page, pageSize: limit }
        );
    }

    public async update(id: string, updateData: Partial<SessionReviewDTO>): Promise<SessionReview | null> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        return await this.sessionReviewRepository.updateSessionReview(id, updateData);
    }

    public async delete(id: string): Promise<boolean> {
        if (!id) {
            throw new Error(i18n.t("id.nonNull"));
        }
        return await this.sessionReviewRepository.deleteSessionReview(id);
    }
}