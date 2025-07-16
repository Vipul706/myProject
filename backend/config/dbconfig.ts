import mongoose from "mongoose";
import { env } from "./envconfig";
import { emitter } from "../utils/emiter";

const connection = mongoose

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
        emitter.emit('log', {
            msg: `✅ MongoDB connected`,
            level: 'info'
        })
    } catch (error) {
        throw (error);
    }
}
export { connectToDatabase };