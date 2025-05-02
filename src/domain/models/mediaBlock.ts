import { Schema, model } from "mongoose";

export interface MediaBlock {
    type: "text" | "image" | "audio";
    text?: string;
    data?: string;
    gridFsId?: string;
    contentType?: string;
    size?: number;
}

export const mediaBlockSchema = new Schema<MediaBlock>({
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

export default model<MediaBlock>("MediaBlock", mediaBlockSchema);