import type { Request, Response } from 'express'
import { emitter } from '../../utils/emiter';

const dashboardPage = async (request: Request, reply: Response) => {
    emitter.emit('log', {
        msg: 'Dashboard Controller initialized',
        level: 'info'
    })
    try {
        reply.render('dashboard/dashboard.ejs');
    } catch (error: any) {
        emitter.emit('error', {
            msg: error.message,
            err: error,
            level: error.level,
            code: 500,
            methodName: dashboardPage.name
        })
        reply.status(500).send(error);
    }
}


export { dashboardPage }