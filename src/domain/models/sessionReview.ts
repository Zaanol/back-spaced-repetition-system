import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface SessionReview extends Document {
    id: string;
    userId: string;
    deckId: string;
    cardIds: string[];
    reviewedCardIds: string[];
    responses: SessionResponse[];
    type: "MIXED" | "NEW" | "REVIEW";
    currentIndex: number;
    isActive: boolean;
    startTime: Date;
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
    userId: {
        type: String,
        ref: "User",
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
    currentIndex: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startTime: {
        type: Date,
        default: () => new Date()
    },
    endTime: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    }
});

sessionReviewSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

sessionReviewSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default model<SessionReview>("SessionReview", sessionReviewSchema);