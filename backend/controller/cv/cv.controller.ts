import type { Request, Response } from 'express'
import { models } from "../../collections/index";
import { createLogger } from '../../utils/logger';
import { errorGenerator } from '../../utils/utils';
const { UserVault } = models
const logger = createLogger();


const getCvTemp = async (req: Request, res: Response) => {
    logger.info('Controller initialized')
    const populatedUser = await UserVault.findOne({ name: "Vipul Singh" }).populate('cv');
    if (!populatedUser.cv) {
        throw errorGenerator(getCvTemp.name,'User or CV not found',500,'error'); 
    }
    res.render('cv_templates/cv.ejs', { data: populatedUser.cv });
};

export { getCvTemp }