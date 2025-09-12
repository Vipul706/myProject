import { models, Model } from 'mongoose';
import type { login, loginErrorCode } from './types';
import { compare } from 'bcryptjs';
import type { IUserDocument } from '../../types/model.type';
import { createToken } from '../../utils/utils';
const UserVault = models['UserVault'] as Model<IUserDocument>; // ✅ THIS is key

const hLogin = async (body: login): Promise<{
    errorCode: loginErrorCode,
    statusCode: number,
    token?: string
}> => {
    try {
        const { pass, email } = body;
        let userData = await UserVault.findOne({ email }).select('+password').populate('cv');

        if (!userData) {
            const newUser = new UserVault({
                email,
                password: pass,
                name: email.split('@')[0]
            });
            userData = await newUser.save();
        }

        // validate password only if it’s an existing user
        if (userData && userData.password) {
            const check = await checkPassword(pass, userData.password);
            if (!check) {
                return {
                    errorCode: 'INVALID_ACCESS',
                    statusCode: 401
                };
            }
        }

        // ✅ Only pick safe fields for JWT payload
        const payload = {
            id: userData._id.toString(),
            email: userData.email,
            name: userData.name,
            isRm:body.isRm
        };

        const token = await createToken(payload);
        userData.token = token
        await userData.save()
        return {
            errorCode: 'NO_ERROR',
            statusCode: userData.isNew ? 201 : 200,
            token
        };
    } catch (error) {
        throw error;
    }
};


const checkPassword = (password: string, hashPassword: string) => {
    return compare(password, hashPassword)
}
export {
    hLogin
}