import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { auditableWithOwnerPlugin, AuditableWithUser } from "../../infrastructure/db/plugins/auditableWithUserPlugin";

export interface Deck extends AuditableWithUser {
    id: string;
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
    name: { type: String, required: true },
    description: { type: String }
});

deckSchema.plugin(auditableWithOwnerPlugin);

deckSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<Deck>("Deck", deckSchema);