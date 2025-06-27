import type { Request, Response } from 'express'
const getCvTemp = (req: Request, res: Response) => {
    res.render('cv.ejs');
}

export { getCvTemp }