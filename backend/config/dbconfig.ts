import mongoose from "mongoose";
import { env } from "./envconfig";
import { createLogger } from "../utils/utils";

const connection = mongoose
const logger = createLogger();

const options = {
    user: env.db_user,
    pass: env.db_pass,
    maxPoolSize: parseInt(env.db_max_pool!),
    minPoolSize: parseInt(env.db_min_pool!),
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    w: 'majority' as const,
    wtimeoutMS: 2500,
    authSource: env.db_pass!,
};

async function connectToDatabase() {
    try {
        await connection.connect(env.db_url + env.db_name, options);
        logger.info("✅ MongoDB connected");
    } catch (error) {
        throw (error);
    }
}
export { connectToDatabase };