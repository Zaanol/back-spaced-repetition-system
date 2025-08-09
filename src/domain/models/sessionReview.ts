import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { auditableWithOwnerPlugin, AuditableWithUser } from "../../infrastructure/db/plugins/auditableWithUserPlugin";

export interface SessionReview extends AuditableWithUser {
    id: string;
    userId: string;
    deckId: string;
    cardIds: string[];
    reviewedCardIds: string[];
    responses: SessionResponse[];
    type: "MIXED" | "NEW" | "REVIEW";
    reviewedCards: number;
    isActive: boolean;
    endTime: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SessionResponse {
    cardId: string;
    quality: number;
    reviewTime: Date;
    needsReview: boolean;
}

const sessionReviewSchema = new Schema<SessionReview>({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
        index: true
    },
    deckId: {
        type: String,
        ref: "Deck",
        required: true,
        index: true
    },
    cardIds: [{
        type: String,
        ref: "Card",
        required: true
    }],
    reviewedCardIds: [{
        type: String,
        ref: "Card"
    }],
    responses: [{
        cardId: { type: String, required: true, ref: "Card" },
        quality: { type: Number, required: true, min: 0, max: 5 },
        reviewTime: { type: Date, required: true },
        needsReview: { type: Boolean, default: false }
    }],
    type: {
        type: String,
        enum: ["MIXED", "NEW", "REVIEW"],
        default: "MIXED"
    },
    reviewedCards: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    endTime: {
        type: Date,
        default: null
    }
});

sessionReviewSchema.plugin(auditableWithOwnerPlugin);

sessionReviewSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<SessionReview>("SessionReview", sessionReviewSchema);