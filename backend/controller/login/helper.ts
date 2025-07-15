import type { Request, Response } from 'express'
import { models, Model } from 'mongoose';
import type { login, loginErrorCode } from './types';
import { compare } from 'bcryptjs';
import type { IUserDocument } from '../../types/model.type';
import { createToken } from '../../utils/utils';
const UserVault = models['UserVault'] as Model<IUserDocument>; // ✅ THIS is key

const hLogin = async (body: login, authToken: string): Promise<{
    errorCode: loginErrorCode,
    code: number,
    token?: string
}> => {
    try {
        const { pass, email } = body;
        const userData = await UserVault.findOne({ email: email }).select('+password').populate('cv').lean();

        if (!userData) {
            return {
                errorCode: 'USER_DOES_NOT_EXIST',
                code: 404
            };
        }

        const check = await checkPassword(pass, userData.password); // Make async
        if (!check) {
            return {
                errorCode: 'INVALID_ACCESS',
                code: 401
            };
        }

        const token = await createToken(userData); // Only run if password is valid
        return {
            errorCode: 'NO_ERROR',
            code: 200,
            token
        };
    } catch (error) {
        throw error;
    }
}

const checkPassword = (password: string, hashPassword: string) => {
    return compare(password, hashPassword)
}
export {
    hLogin
}