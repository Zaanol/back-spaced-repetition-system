import { Document, Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Deck extends Document {
    name: string;
    description: string;
}

const deckSchema = new Schema<Deck>({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
        index: true
    },
    name: { type: String, required: true },
    description: { type: String }
});

deckSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<Deck>('Deck', deckSchema);