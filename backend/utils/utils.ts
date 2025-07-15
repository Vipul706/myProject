import { AppError } from '../types/express-error';
import { models } from './../collections/index';
const { blackBox } = models
import type { LogLevel, ParsedError } from "../types/types";
import { env } from '../config/envconfig';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { define } from '../config/define';
import { compare, hash } from 'bcryptjs';

const secret = new TextEncoder().encode(env.JWTKEY);
const saltRounds = 10;

async function errorParser(error: any, methodName: string, level: LogLevel = 'fatal', code: number = 500): Promise<ParsedError> {
    const err = await blackBox.findOne({ stack: error.stack, method: methodName })
    if (!err) {
        await blackBox.create({
            message: error.message,
            method: methodName,
            name: error.name,
            level: level,
            stack: error.stack || 'No stack trace',
        })
    }
    if (error instanceof Error) {
        return {
            name: error.name,
            method: methodName,
            message: error.message,
            stack: error.stack || 'No stack trace',
            level: level,
            code: code
        };
    }

    return {
        name: 'UnknownError',
        method: methodName,
        message: String(error),
        stack: 'No stack trace',
        level: level,
        code: code
    };
}

function errorGenerator(fnName: string, message: string, code: number, level: LogLevel, method: string) {
    const error = new AppError();
    error.message = message
    error.name = fnName
    error.level = level
    error.statusCode = code
    error.methodName = method
    return error
}

async function createToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h') // You can change this to '2h', '7d', etc.
        .sign(secret);
}
async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        // Token is invalid, expired, or tampered with
        return null;
    }
}

export {
    errorParser,
    errorGenerator,
    createToken,
    verifyToken
};