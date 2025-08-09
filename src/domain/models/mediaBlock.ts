import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { auditableWithOwnerPlugin, AuditableWithUser } from "../../infrastructure/db/plugins/auditableWithUserPlugin";

export interface MediaBlock extends AuditableWithUser {
    id: string;
    type: MediaBlockType;
    text?: string;
    data?: Buffer;
    gridFsId?: mongoose.Types.ObjectId;
    contentType?: string;
    size?: number;
}

export type MediaBlockType = "text" | "image" | "audio";

export const mediaBlockSchema = new Schema<MediaBlock>({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["text", "image", "audio"],
        required: true
    },
    text: {
        type: String,
        required: function() {
            return this.type === "text";
        }
    },
    data: {
        type: Buffer,
        required: function() {
            return this.type !== "text" && !this.gridFsId;
        },
        validate: {
            validator: function(v: Buffer) {
                return this.type === "text" || v.length < 16 * 1024 * 1024;
            },
            message: "Inline data must be smaller than 16MB"
        }
    },
    gridFsId: {
        type: String,
        required: function() {
            return this.type !== "text" && !this.data;
        }
    },
    contentType: {
        type: String,
        required: function() {
            return this.type !== "text";
        }
    },
    size: {
        type: Number,
        required: function() {
            return this.type !== "text";
        }
    }
});

mediaBlockSchema.plugin(auditableWithOwnerPlugin);

export default model<MediaBlock>("MediaBlock", mediaBlockSchema);