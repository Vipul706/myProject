import { Schema } from "mongoose";

const pulseStreamSchema = new Schema(
  {
    url: { type: String, required: true },
    originalUrl: { type: String, required: true },
    method: { type: String, required: true },
    host: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '30d' }
  },
  {
    collection: 'pulseStream'
  }
);

// REQUIRED exports for dynamic model registration
export const modelName = "pulseStream";
export const schema = pulseStreamSchema;
