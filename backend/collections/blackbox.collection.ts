import { Schema } from "mongoose";

const blackBoxSchema = new Schema(
    {
        message: { type: String, required: true },
        name: { type: String, required: true },
        method: { type: String, required: true },
        stack: { type: String },
        level: {
            type: String,
            enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
            default: 'error'
        },
        meta: { type: Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now, expires: '30d' }
    },
    {
        collection: "blackBox",
    }
);
// REQUIRED exports for dynamic registration
export const modelName = "blackBox";
export const schema = blackBoxSchema;
