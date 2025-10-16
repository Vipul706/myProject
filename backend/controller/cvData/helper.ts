import type { AddCvDataRequest, helperType } from "./types";
import { getMongooseModel } from "../../utils/utils";
import type { IUserDocument } from "../../types/model.type";
import type { Model } from "mongoose";

const hAddCvData = async (reqBody: AddCvDataRequest): Promise<helperType> => {
    try {
        const UserVault: Model<IUserDocument> = getMongooseModel("UserVault");
        const DeepResume: Model<IUserDocument> = getMongooseModel("DeepResume");

        const userData = await UserVault.findOne({ email: reqBody.email });
        if (!userData) {
            return {
                errorCode: "USER_DOES_NOT_EXIST",
                statusCode: 404,
            };
        }

        // Map frontend experiences to schema
        const expData = reqBody.experiences.map((exp: any) => ({
            name: exp.company,               // map company -> name
            duration: exp.duration.join(" - "), // join array into string
            position: exp.position,
            pointers: exp.pointers            // already string or array, matches schema
        }));

        // Find existing CV data
        let cvData: any = await DeepResume.findOne({ user: userData._id });
        if (cvData) {
            // ✅ Update existing document
            cvData.exp = expData;
            cvData.skills = reqBody.skills;
            cvData.languages = reqBody.languages;
            await cvData.save();
        } else {
            // ✅ Create new CV document
            cvData = await DeepResume.create({
                user: userData._id,
                exp: expData,
                skills: reqBody.skills,
                languages: reqBody.languages 
            });
        }

        return {
            errorCode: "NO_ERROR",
            statusCode: 200,
        };
    } catch (error) {
        throw error;
    }
};

export { hAddCvData };
