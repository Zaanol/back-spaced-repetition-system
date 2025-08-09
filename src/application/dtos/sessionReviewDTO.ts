export interface SessionReviewDTO {
    userId: string;
    deckId: string;
    cardIds: string[];
    type: SessionReviewType;
}

export interface CreateSessionReviewDTO {
    deckId: string;
    type: SessionReviewType;
}

export type SessionReviewType = "MIXED" | "NEW" | "REVIEW";