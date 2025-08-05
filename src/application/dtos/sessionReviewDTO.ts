export interface SessionReviewDTO {
    userId: string;
    deckId: string;
    cardIds: string[];
    type: SessionReviewType;
}

export interface CreateSessionReviewDT {
    deckId: string;
    type: SessionReviewType;
}

export type SessionReviewType = "MIXED" | "NEW" | "REVIEW";