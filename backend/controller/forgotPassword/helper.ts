import { models, Model } from "mongoose";
import type { IUserDocument } from "../../types/model.type";
import type { forgotPassword, forgotPasswordErrorCode } from "./types"
import { AppError } from "../../types/express-error";
const UserVault = models['UserVault'] as Model<IUserDocument>; // ✅ THIS is key


// TODO:: SendMail to Email


const hForgotPassword = async (
    reqBody: forgotPassword
): Promise<{
    errorCode: forgotPasswordErrorCode,
    statusCode: number,
}> => {
    try {
        const { email } = reqBody;
        const userData = await UserVault.findOne({ email });

        if (!userData) {
            return {
                errorCode: 'USER_DOES_NOT_EXIST',
                statusCode: 401
            };
        }

        if (userData.prCounter >= 3) {
            return {
                errorCode: 'MAX_ATTEMPT_REACHED',
                statusCode: 401
            };
        }

        // ✅ Correctly increment
        userData.prCounter += 1;

        // ✅ Track last reset timestamp
        userData.lastPasswordResetAt = new Date();

        await userData.save();

        return {
            errorCode: 'NO_ERROR',
            statusCode: 200
        };
    } catch (error: any) {
        const err = new AppError(
            error.stack,
            error.message,
            500,
            hForgotPassword.name,
            'FP_EXCEPTION'
        );
        throw err;
    }
};


export {
    hForgotPassword
}