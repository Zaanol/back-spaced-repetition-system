export interface SessionReviewDTO {
    deckId: string;
    cardIds: string[];
    type: SessionReviewType;
}

export interface CreateSessionReviewDTO {
    deckId: string;
    type: SessionReviewType;
}

export type SessionReviewType = "MIXED" | "NEW" | "REVIEW";

export interface ReviewCardDTO {
    cardId: string;
    quality: number;
}

export interface ReviewCardsDTO {
    id: string;
    reviews: ReviewCardDTO[];
}

export interface PhaseResultDTO {
    repetitions: number;
    learningStep: number;
    isLearning: boolean;
    intervalDays: number;
}

export interface ReviewPhaseResultDTO extends PhaseResultDTO{
    easinessFactor: number;
}