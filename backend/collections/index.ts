import mongoose from "mongoose";
import { blackBoxSchema } from "./blackbox.collection";
import { pulseStreamSchema } from "./pulseStream.collection";
import { createLogger } from "../utils/logger";

const logger = createLogger()

const registerCollections = () => {
    try {
        const blackBox = mongoose.model("blackBox", blackBoxSchema);
        const pulseStream = mongoose.model('pulseStream', pulseStreamSchema)
        logger.info('Collections Registered')
        return {
            blackBox,
            pulseStream
        }
    } catch (error) {
        throw (error)
    }
}

export const models = registerCollections();