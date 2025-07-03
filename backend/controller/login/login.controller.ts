import type { Request, Response } from 'express'
const loginPage = async (req: Request, res: Response) => {
    res.render('login/login.ejs');
}

export { loginPage }