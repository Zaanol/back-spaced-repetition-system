import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface Deck extends Document {
    id: string;
    userId: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

const deckSchema = new Schema<Deck>({
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
    name: { type: String, required: true },
    description: { type: String },

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

deckSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

deckSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default model<Deck>("Deck", deckSchema);