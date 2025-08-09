import { SessionReviewRepository } from "../../infrastructure/repositories/sessionReviewRepository";
import {
    CreateSessionReviewDTO,
    PhaseResultDTO,
    ReviewCardDTO,
    ReviewCardsDTO,
    ReviewPhaseResultDTO
} from "../dtos/sessionReviewDTO";
import { SessionResponse, SessionReview } from "../../domain/models/sessionReview";
import i18n from "../../config/i18n";
import { FilterQuery } from "mongoose";
import { DeckRepository } from "../../infrastructure/repositories/deckRepository";
import { PaginatedResult } from "../../infrastructure/repositories/baseRepository";
import { CardRepository } from "../../infrastructure/repositories/cardRepository";

//TODO Implement translations
export class SessionReviewService {
    private sessionReviewRepository: SessionReviewRepository;
    private deckRepository: DeckRepository;
    private cardRepository: CardRepository;

    private LEARNING_STEPS = [1, 10, 15]; //Fixed for now

    constructor(sessionReviewRepository: SessionReviewRepository,
                deckRepository: DeckRepository,
                cardRepository: CardRepository
    ) {
        this.sessionReviewRepository = sessionReviewRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
    }

    public async create(sessionReviewDTO: CreateSessionReviewDTO): Promise<SessionReview> {
        let deckId = sessionReviewDTO.deckId;

        if (!await this.deckRepository.existsDeckById(deckId)) {
            throw new Error(i18n.t("deck.notFound"));
        }

        let cardIds: string[] = await this.cardRepository.getCardsIdsForReview(deckId, {
            sessionType: sessionReviewDTO.type
        });

        if (cardIds.length === 0) {
            throw new Error(i18n.t("sessionReview.cards.empty")); //TODO Create i18n
        }

        return await this.sessionReviewRepository.createSessionReview({
            ...sessionReviewDTO,
            cardIds
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

    public async reviewCards(reviewsDTO: ReviewCardsDTO): Promise<SessionReview> {
        const { id: sessionReviewId, reviews } = reviewsDTO;

        const session = await this.loadActiveSession(sessionReviewId);
        this.validateReviewCards(reviews, session);

        const reviewDate = new Date();
        const cardUpdates: Array<{ id: string; updateData: Partial<any> }> = [];
        const responses = await Promise.all(
            reviews.map(({ cardId, quality }) =>
                this.processSingleReview(cardId, quality, reviewDate, cardUpdates)
            )
        );

        await this.applyCardUpdates(cardUpdates);

        return await this.updateSession(session, reviews, responses, sessionReviewId);
    }

    private async loadActiveSession(id: string): Promise<SessionReview> {
        const session = await this.sessionReviewRepository.findSessionReviewById(id);

        if (!session) {
            throw new Error(i18n.t("sessionReview.notFound")); //TODO Create i18n
        }

        if (!session.isActive) {
            throw new Error(i18n.t("sessionReview.alreadyCompleted")); //TODO Create i18n
        }

        return session;
    }

    private validateReviewCards(reviews: ReviewCardDTO[], session: SessionReview): void {
        const planned = new Set(session.cardIds);
        const done = new Set(session.reviewedCardIds);

        for (const { cardId } of reviews) {
            if (!planned.has(cardId)) {
                throw new Error(i18n.t("sessionReview.cardNotInSession", { cardId })); //TODO Create i18n
            }

            if (done.has(cardId)) {
                throw new Error(i18n.t("sessionReview.cardAlreadyReviewed", { cardId })); //TODO Create i18n
            }
        }
    }

    private async processSingleReview(
        cardId: string,
        quality: number,
        reviewDate: Date,
        cardUpdates: Array<{ id: string; updateData: Partial<any> }>
    ): Promise<SessionResponse> {
        const card = await this.cardRepository.findCardById(cardId);

        if (!card) {
            throw new Error(i18n.t("card.notFound", { cardId }));
        }

        let { repetitions, easinessFactor, intervalDays, learningStep, isLearning } = card;
        const isStillLearning = isLearning || repetitions === 0;

        if (isStillLearning) {
            ({ repetitions, learningStep, isLearning, intervalDays } =
                this.handleLearningPhase(quality, repetitions, learningStep));
        } else {
            ({ repetitions, easinessFactor, learningStep, isLearning, intervalDays } =
                this.handleReviewPhase(quality, repetitions, easinessFactor, intervalDays));
        }

        const nextReviewDate = this.computeNextReviewDate(
            reviewDate,
            isLearning,
            learningStep,
            intervalDays
        );

        cardUpdates.push({
            id: cardId,
            updateData: {
                repetitions,
                easinessFactor,
                intervalDays,
                learningStep,
                isLearning,
                nextReviewDate,
                lastReviewed: reviewDate,
                totalReviews: (card.totalReviews || 0) + 1
            }
        });

        const needsReview =
            (isLearning && learningStep < this.LEARNING_STEPS.length) ||
            (!isLearning && quality < 4);

        return { cardId, quality, reviewTime: reviewDate, needsReview };
    }

    private handleLearningPhase(
        quality: number,
        repetitions: number,
        learningStep: number
    ): PhaseResultDTO {
        if (quality >= 3) {
            learningStep++;

            if (learningStep >= this.LEARNING_STEPS.length) {
                return { repetitions: 1, isLearning: false, learningStep, intervalDays: 1 };
            }
        } else {
            learningStep = 0;
        }

        return { repetitions, isLearning: true, learningStep, intervalDays: 0 };
    }

    private handleReviewPhase(
        quality: number,
        repetitions: number,
        ef: number,
        intervalDays: number
    ): ReviewPhaseResultDTO {
        ef = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

        if (quality < 3) {
            return { repetitions: 0, isLearning: true, learningStep: 0, easinessFactor: ef, intervalDays: 0 };
        }

        repetitions++;

        if (repetitions === 1) {
            intervalDays = 1;
        } else if (repetitions === 2) {
            intervalDays = 3;
        } else {
            intervalDays = Math.round(intervalDays * ef);
        }

        return { repetitions, easinessFactor: ef, isLearning: false, learningStep: 0, intervalDays };
    }

    private computeNextReviewDate(
        baseDate: Date,
        isLearning: boolean,
        learningStep: number,
        intervalDays: number
    ): Date {
        if (isLearning) {
            return new Date(baseDate.getTime() + this.LEARNING_STEPS[learningStep] * 60000);
        }

        return new Date(baseDate.getTime() + intervalDays * 86400000);
    }

    private async applyCardUpdates(
        updates: Array<{ id: string; updateData: Partial<any> }>
    ): Promise<void> {
        const success = await this.cardRepository.batchUpdateCards(updates);

        if (!success) {
            throw new Error(i18n.t("card.batchUpdateFailed")); //TODO Create i18n
        }
    }

    private async updateSession(
        session: SessionReview,
        reviews: ReviewCardDTO[],
        responses: SessionResponse[],
        sessionReviewId: string
    ): Promise<SessionReview> {
        session.reviewedCardIds.push(...reviews.map(r => r.cardId));
        session.responses.push(...responses);
        session.reviewedCards += reviews.length;

        if (session.reviewedCards >= (session.cardIds?.length || 0)) {
            session.isActive = false;
            session.endTime = new Date();
        }

        const updated = await this.sessionReviewRepository.updateSessionReview(
            sessionReviewId,
            {
                reviewedCardIds: session.reviewedCardIds,
                responses: session.responses,
                reviewedCards: session.reviewedCards,
                isActive: session.isActive,
                endTime: session.endTime
            }
        );

        if (!updated) {
            throw new Error(i18n.t("sessionReview.updateFailed")); //TODO Create i18n
        }

        return updated;
    }
}