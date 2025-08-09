import { Schema, Document, Query } from "mongoose";
import { getContextUserId } from "../../security/context/auth";

export interface AuditableWithUser extends Document {
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export function auditableWithOwnerPlugin(schema: Schema) {
    schema.add({
        userId: { type: String, ref: "User", required: true, index: true },
        createdAt: { type: Date, default: () => new Date(), immutable: true },
        updatedAt: { type: Date, default: () => new Date() }
    });

    schema.pre<AuditableWithUser>("validate", function (next) {
        const userId = getContextUserId();

        if (this.isNew) {
            this.userId = userId;
        } else if (this.userId !== userId) {
            return next(new Error("Unauthorized: cannot change userId"));
        }
        next();
    });

    schema.pre<AuditableWithUser>("save", function (next) {
        this.updatedAt = new Date();
        next();
    });

    schema.pre<Query<any, AuditableWithUser>>(/^find/, function (next) {
        const userId = getContextUserId();

        this.where({ userId: userId });

        next();
    });
}