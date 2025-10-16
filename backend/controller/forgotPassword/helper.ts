import type { forgotPassword, forgotPasswordErrorCode } from "./types"
import { AppError } from "../../types/express-error";
import type { Request } from 'express'
import { createToken, getMongooseModel, sendEmail } from "../../utils/utils";
import type { SendResetEmailOptions } from "../../types/types";
import { emitter } from "../../utils/emiter";
import { env } from "../../config/envconfig";
const UserVault = getMongooseModel('UserVault')  // ✅ THIS is key


async function generateResetPasswordHtml(resetLink: string, email: string): Promise<string> {
    const encodedEmail = await createToken({ email:email },true)
    const linkEnv = env.pro_env === 'local' ? 'http' : 'https'
    const link = `${linkEnv}://${resetLink}?token=${encodedEmail}`
    return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>If the button above doesn’t work, copy and paste the following URL into your browser:</p>
      <p style="word-break: break-all;">
        <a href="${link}" style="color: #007bff;">${link}</a>
      </p>
      <p>If you did not request a password reset, you can safely ignore this email. No changes were made to your account.</p>
      <p>Thank you,<br/>The YourApp Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">If you have any questions, reply to this email or contact our support team.</p>
    </div>
    `;
}


const hForgotPassword = async (
    request: Request,
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

        const emailObj: SendResetEmailOptions = {
            toEmail: reqBody.email,
            subject: 'Reset your password before the link expires',
            html: await generateResetPasswordHtml(request.host + request.baseUrl + '/resetPassword', reqBody.email)
        }

        const sendEmailRes = await sendEmail(emailObj)

        if (sendEmailRes.errorCode !== 'NO_ERROR') {
            return {
                errorCode: sendEmailRes.errorCode,
                statusCode: 500
            };
        }

        return {
            errorCode: 'NO_ERROR',
            statusCode: 200
        };
    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, hForgotPassword.name, 'FP_EXCEPTION');
        emitter.emit('error', {
            msg: orgError.message,
            level: 'info',
            stack: orgError.stack!,
            code: orgError.statusCode,
            methodName: orgError.methodName
        })
        throw orgError;
    }
};


export {
    hForgotPassword
}