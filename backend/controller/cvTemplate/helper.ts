import { errorGenerator } from '../../utils/utils';
import { Model, models } from 'mongoose';
import type { CvData, cvErrorCode } from './types';
import type { IUser, IUserDocument } from '../../types/model.type';
const UserVault = models['UserVault'] as Model<IUserDocument>; // ✅ THIS is key

const hCvTemplate = async (): Promise<{ errorCode: cvErrorCode, code: number, data?: CvData,userData:IUser }> => {
    try {
        const populatedUser = await UserVault.findOne({ email: "vipulsignh.1@gmail.com" }).populate('cv').lean();
        
        if (!populatedUser || (populatedUser && !populatedUser.cv)) {
            const err = await errorGenerator("Db Error", 'USER_DATA_DOES_NOT_EXIST', 500, 'error', hCvTemplate.name, "On " + hCvTemplate.name);
            throw err
        }
        const resumeData: CvData = populatedUser.cv as CvData
        return {
            errorCode: 'NO_ERROR',
            data: resumeData,
            userData:populatedUser,
            code: 200
        }
    } catch (error: any) {
        throw (error)
    }
}
export {
    hCvTemplate
}