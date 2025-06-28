import mongoose from "mongoose";

const pulseStreamSchema = new mongoose.Schema({
    url: { type: String, required: true },
    originalUrl: { type: String, required: true },
    method: { type: String, required: true },
    host: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '30d' }
}, {
    collection: 'pulseStream'
})

export {
    pulseStreamSchema
}