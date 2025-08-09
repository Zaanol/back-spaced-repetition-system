import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { auditableWithOwnerPlugin, AuditableWithUser } from "../../infrastructure/db/plugins/auditableWithUserPlugin";

export interface Card extends AuditableWithUser {
    id: string;
    deckId: string;
    frontMediaIds: String[];
    backMediaIds: String[];
    repetitions: number;
    easinessFactor: number;
    intervalDays: number;
    nextReviewDate: Date;
    lastReviewed: Date | null;
    totalReviews: number;
    learningStep: number;
    isLearning: boolean;
}

const cardSchema = new Schema<Card>({
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
    frontMediaIds: [{
        type: String,
        ref: "MediaBlock"
    }],
    backMediaIds: [{
        type: String,
        ref: "MediaBlock"
    }],

    repetitions: {
        type: Number,
        default: 0,
        min: 0
    },
    easinessFactor: {
        type: Number,
        default: 2.5,
        min: 1.3
    },
    intervalDays: {
        type: Number,
        default: 1,
        min: 1
    },
    nextReviewDate: {
        type: Date
    },
    lastReviewed: {
        type: Date,
        default: null
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },

    learningStep: {
        type: Number,
        default: 0,
        min: 0
    },
    isLearning: {
        type: Boolean,
        default: true
    }
});

cardSchema.index({ deckId: 1, isLearning: -1, repetitions: 1, nextReviewDate: 1 });
cardSchema.index({ deckId: 1, repetitions: 1, isLearning: -1 });
cardSchema.index({ deckId: 1, isLearning: 1, repetitions: 1, nextReviewDate: 1 });
cardSchema.index({ deckId: 1, isLearning: -1, learningStep: 1, nextReviewDate: 1 });
cardSchema.index({ deckId: 1, nextReviewDate: 1, createdAt: 1 });
cardSchema.index({ deckId: 1, nextReviewDate: 1, isLearning: -1, repetitions: 1 });

cardSchema.plugin(auditableWithOwnerPlugin);

cardSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<Card>("Card", cardSchema);