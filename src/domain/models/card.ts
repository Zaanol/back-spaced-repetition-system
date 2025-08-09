import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface Card extends Document {
    id: string;
    userId: string;
    deckId: string;
    frontMediaIds: String[];
    backMediaIds: String[];
    repetitions: number;
    easinessFactor: number;
    intervalDays: number;
    nextReviewDate: Date;
    lastReviewed: Date | null;
    learningStep: number;
    isLearning: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const cardSchema = new Schema<Card>({
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

    learningStep: {
        type: Number,
        default: 0,
        min: 0
    },
    isLearning: {
        type: Boolean,
        default: true
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

cardSchema.index({ deckId: 1, isLearning: -1, repetitions: 1, nextReviewDate: 1 });
cardSchema.index({ deckId: 1, repetitions: 1, isLearning: -1 });
cardSchema.index({ deckId: 1, isLearning: 1, repetitions: 1, nextReviewDate: 1 });
cardSchema.index({ deckId: 1, isLearning: -1, learningStep: 1, nextReviewDate: 1 });
cardSchema.index({ deckId: 1, nextReviewDate: 1, createdAt: 1 });
cardSchema.index({ deckId: 1, nextReviewDate: 1, isLearning: -1, repetitions: 1 });

cardSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

cardSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default model<Card>("Card", cardSchema);