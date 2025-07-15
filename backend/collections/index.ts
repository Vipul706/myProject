import mongoose, { Model, Schema } from "mongoose";
import { createLogger } from "../utils/logger";
import { readdirSync } from "fs";
import { join, resolve } from "path";

const logger = createLogger();

// 👇️ Helper type to preserve full typings
type RegisteredModel<T = any> = Model<T, {}, {}, {}, any, Schema<T>>;

export const registerCollections = () => {
    try {
        const modelsDir = resolve(__dirname, './');
        const registeredModels: Record<string, RegisteredModel> = {};
        const files = readdirSync(modelsDir);

        for (const file of files) {
            if (file.endsWith('.collection.ts')) {
                const fullPath = join(modelsDir, file);
                const { modelName, schema } = require(fullPath);

                if (modelName && schema) {
                    registeredModels[modelName] = mongoose.model(modelName, schema);
                    logger.info(`✅ Model registered: ${modelName}`);
                } else {
                    logger.warn(`⚠️ Skipping file (missing modelName or schema): ${file}`);
                }
            }
        }

        logger.info('📦 Collections Registered');
        return registeredModels;
    } catch (error) {
        logger.error("❌ Error registering collections", error);
        throw error;
    }
};

export const models = registerCollections();
