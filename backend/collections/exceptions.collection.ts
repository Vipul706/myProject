import mongoose from "mongoose";

const blackBoxSchema = new mongoose.Schema(
    {
        message: { type: String, required: true },              // Error message
        name: { type: String, required: true },
        method: { type: String, required: true },
        stack: { type: String },                                // Stack trace
        level: { type: String, default: "error" },              // Severity: error/warn/info
        meta: { type: mongoose.Schema.Types.Mixed },            // Any extra data
        createdAt: { type: Date, default: Date.now, expires: '30d' }  // TTL: auto-delete after 30 days
    },
    {
        collection: "blackBox",
    }
);


export {
    blackBoxSchema
}