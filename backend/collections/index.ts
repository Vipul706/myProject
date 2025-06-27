import mongoose from "mongoose";
import { blackBoxSchema } from "./exceptions.collection";

const registerCollections = () => {
    const blackBox = mongoose.model("blackBox", blackBoxSchema);
    return {
        blackBox
    }
}

export const models = registerCollections();