import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { MediaBlock, mediaBlockSchema } from "./mediaBlock";

export interface Card extends Document {
    id: string;
    deckId: string;
    front: MediaBlock[];
    back: MediaBlock[];
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
    front: [mediaBlockSchema],
    back: [mediaBlockSchema]
});

cardSchema.set("toJSON", {
    transform: (doc, ret) => {
        let convertToBase64 = (block: any) => {
            if (block.data) {
                block.data = block.data.toString("base64");
            }

            return block;
        };

        ret.front = ret.front.map(convertToBase64);
        ret.back = ret.back.map(convertToBase64);

        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<Card>("Card", cardSchema);