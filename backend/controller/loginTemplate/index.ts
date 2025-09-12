import type { Request, Response } from 'express'
import { emitter } from '../../utils/emiter';

const loginPage = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'LoginPage Controller initialized',
        level: 'info'
    })
    try {
        reply.render('login_templates/login.ejs');
    } catch (error: any) {
        emitter.emit('error', {
            msg: error.message,
            err: error,
            level: error.level,
            code: 500,
            methodName: loginPage.name
        })
        reply.status(500).send(error);
    }
}


export { loginPage }