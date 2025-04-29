import { Document, Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface User extends Document {
    username: string;
    email: string;
    password: string;
}

const userSchema = new Schema<User>({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default model<User>('User', userSchema);