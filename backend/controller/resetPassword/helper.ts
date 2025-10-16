import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";
import { generatePassword, getMongooseModel, sendEmail, verifyToken } from "../../utils/utils";
import { hForgotPassword } from "../forgotPassword/helper";
import type { prRequest, resetPasswordErrorCodes } from "./type";
import type { Request } from 'express'
const UserVault = getMongooseModel('UserVault')  // ✅ THIS is key


// TODO:: fixed the error handling in the catch
const hResetPassword = async (request: Request): Promise<{
    errorCode: resetPasswordErrorCodes,
    statusCode: number,
}> => {
    try {
        const token = request.query.token as string
        const userTokenData = await verifyToken(token) as prRequest
        const password = generatePassword(10, [3, 8])
        const userData = await UserVault.findOne({ email: userTokenData.email })
        userData!.password = password
        await userData?.save()
        const sendEmailRes = await sendEmail({
            toEmail: userTokenData.email,
            subject: 'Security Notice: Your Password Has Been Changed',
            html: await generatePasswordResentHtml(password)
        })
        if (sendEmailRes.errorCode !== 'NO_ERROR') {
            return {
                errorCode: sendEmailRes.errorCode,
                statusCode: 500
            };
        }
        return {
            errorCode: 'NO_ERROR',
            statusCode: 200
        }
    } catch (e) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, hForgotPassword.name, 'RP_EXCEPTION');
        emitter.emit('error', {
            msg: orgError.message,
            level: 'info',
            stack: orgError.stack!,
            code: orgError.statusCode,
            methodName: orgError.methodName
        })
        throw orgError;
    }
}

async function generatePasswordResentHtml(password: string): Promise<string> {
    return `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #2c3e50;">Your Password Has Been Reset</h2>
    <p>Hello,</p>
    <p>Your password has been successfully reset. You can now use the following password to log in to your account:</p>
    
    <p style="background-color: #efefef; padding: 12px 20px; border-radius: 6px; font-size: 18px; font-weight: bold; text-align: center; letter-spacing: 1px; color: #2c3e50;">
      ${password}
    </p>

    <p>For security reasons, we recommend changing this password after logging in.</p>

    <p>If you did not request this password change, please contact our support team immediately.</p>

    <p>Thank you,<br/>The YourApp Team</p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">If you have any questions, reply to this email or contact our support team.</p>
  </div>
  `;
}


export { hResetPassword }