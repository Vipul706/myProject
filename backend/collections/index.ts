import mongoose, { Model, Schema } from "mongoose";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import { emitter } from "../utils/emiter";

interface CollectionModule {
  modelName: string;
  schema: Schema;
}

// Simplify RegisteredModel type to avoid conflicts
type RegisteredModel<T = any> = Model<T>;

export const registerCollections = () => {
  try {
    const modelsDir = resolve(__dirname, './');
    const registeredModels: Record<string, RegisteredModel<any>> = {};
    const files = readdirSync(modelsDir);

    for (const file of files) {
      if (file.endsWith('.collection.ts')) {
        const fullPath = join(modelsDir, file);
        const { modelName, schema } = require(fullPath) as CollectionModule;

        if (modelName && schema) {
          registeredModels[modelName] = mongoose.model(modelName, schema);
          emitter.emit('log', {
            msg: `✅ Model registered: ${modelName}`,
            level: 'info'
          });
        } else {
          emitter.emit('log', {
            msg: `⚠️ Skipping file (missing modelName or schema): ${file}`,
            level: 'warn'
          });
        }
      }
    }

    emitter.emit('log', {
      msg: `📦 Collections Registered`,
      level: 'info'
    });

    return registeredModels;
  } catch (error) {
    emitter.emit('log', {
      msg: `❌ Error registering collections`,
      level: 'error'
    });
    throw error;
  }
};

export const models = registerCollections();
