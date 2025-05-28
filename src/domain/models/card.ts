import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface Card extends Document {
    id: string;
    deckId: string;
    frontMediaIds: String[];
    backMediaIds: String[];
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
    }]
});

cardSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<Card>("Card", cardSchema);