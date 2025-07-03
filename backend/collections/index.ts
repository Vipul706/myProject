import mongoose from "mongoose";
import { createLogger } from "../utils/logger";
import { readdirSync } from "fs";
import { join, resolve } from "path";

const logger = createLogger()

const registerCollections = () => {
    try {
        const modelsDir = resolve(__dirname, './');
        const registeredModels: Record<string, mongoose.Model<any>> = {};
        const files = readdirSync(modelsDir);
        files
            .filter(file => file.endsWith('.collection.ts') || file.endsWith('.collection.js'))
            .forEach(file => {
                const fullPath = join(modelsDir, file);
                const { modelName, schema } = require(fullPath);

                if (modelName && schema) {
                    registeredModels[modelName] = mongoose.model(modelName, schema);
                    logger.info(`Model registered: ${modelName}`);
                } else {
                    logger.warn(`Skipping file (no modelName or schema): ${file}`);
                }
            });
        logger.info('Collections Registered')
        return registeredModels
    } catch (error) {
        throw (error)
    }
}

export const models = registerCollections();