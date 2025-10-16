import { AppError } from '../types/express-error';
import { models } from './../collections/index';
import type { LogLevel, ParsedError, SendResetEmailOptions } from "../types/types";
import { env } from '../config/envconfig';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { Model } from 'mongoose';
import type { IUserDocument } from '../types/model.type';
import { emitter } from './emiter';
import { createTransport } from 'nodemailer'
const blackBox = models['blackBox'] as Model<IUserDocument>; // ✅ THIS is key

const secret = new TextEncoder().encode(env.JWTKEY);

async function errorParser(
    error: unknown,
    methodName: string,
    level: LogLevel = 'fatal',
    code: number = 500
): Promise<ParsedError> {
    const isError = error instanceof Error;

    const stack = isError ? error.stack ?? 'No stack trace' : 'No stack trace';
    const message = isError ? error.message ?? 'Error' : String(error);
    const name = isError ? error.name ?? 'Server Error' : 'UnknownError';

    const existingError = await blackBox.findOne({
        stack,
        method: methodName,
    });

    if (!existingError) {
        await blackBox.create({
            message,
            method: methodName || errorParser.name,
            name,
            level,
            stack,
        });
    }

    return {
        name,
        method: methodName,
        message,
        stack,
        level,
        code,
    };
}


async function errorGenerator(fnName: string, message: string, code: number = 500, level: LogLevel = 'fatal', method: string = '', stack: string) {
    const error = new AppError();
    error.message = message
    error.name = fnName
    error.level = level
    error.statusCode = code
    error.methodName = method
    error.stack = stack
    return error
}

async function createToken(payload: JWTPayload, prCheck?: boolean): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(prCheck ? '15M' : payload.isRm ? '7D' : '1D') // You can change this to '2h', '7d', etc.
        .sign(secret);
}
async function verifyToken(token: string): Promise<JWTPayload | unknown> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        // Token is invalid, expired, or tampered with
        return error;
    }
}

function generatePassword(length: number, specialCharRange: [number, number]): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const specialChars = '!@#$%^&*()'; // Only safe special characters

    const allNonSpecial = lowercase + uppercase + digits;

    if (length < specialCharRange[1]) {
        throw new Error('Password length must be greater than special character end range.');
    }

    // Step 1: Initialize password with random non-special characters
    const result: string[] = [];
    for (let i = 0; i < length; i++) {
        const char = allNonSpecial[Math.floor(Math.random() * allNonSpecial.length)];
        result.push(char);
    }

    // Step 2: Decide how many special characters to insert (between 3 and 6)
    const numSpecials = Math.min(Math.floor(Math.random() * 4) + 3, specialCharRange[1] - specialCharRange[0] + 1);

    // Step 3: Generate unique positions within the range to place special characters
    const [start, end] = specialCharRange;
    const positions = new Set<number>();
    while (positions.size < numSpecials) {
        const pos = Math.floor(Math.random() * (end - start + 1)) + start;
        positions.add(pos);
    }

    // Step 4: Replace characters at those positions with random special characters
    for (const pos of positions) {
        const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
        result[pos] = specialChar;
    }

    return result.join('');
}



// Models
const UserVault = models['UserVault'] as Model<IUserDocument>;
const DeepResume = models['DeepResume'] as Model<IUserDocument>;

async function seedUserWithResume() {
    const userData = {
        name: "vipul singh",
        email: "a@gmail.com", // Must match allowedDomains in your schema
        password: "123456" // Will be hashed via pre-save hook
    };

    try {
        // 🔎 Check if user already exists
        const existingUser = await UserVault.findOne({ email: userData.email });

        if (existingUser) {
            emitter.emit('log', {
                msg: `User with email ${userData.email} already exists. Skipping creation.`,
                level: 'info',
            });
            return;
        }

        // ✅ Step 1: Create user
        const newUser = new UserVault(userData);
        await newUser.save();

        // ✅ Step 2: Create resume linked to user
        const resumeData = {
            user: newUser._id,
            exp: [
                {
                    name: "Madds PVT LTD",
                    duration: "2018 - 2023",
                    position: "Software Engineer",
                    pointers: [
                        "Contributed to the design and development of enterprise-grade IoT applications using the MEAN stack...",
                        "Collaborated with cross-functional teams to build scalable backend APIs in Node.js and MongoDB...",
                        "Led the development of 'Anirax', a modern MERN stack-based video streaming platform...",
                        "Implemented CI/CD pipelines and Docker-based deployments..."
                    ]
                },
                {
                    name: "Q3 Technology",
                    duration: "2023 - 2024",
                    position: "Software Engineer",
                    pointers: [
                        "Worked closely with Hero MotoCorp to design and develop critical mobile applications...",
                        "Developed and maintained the 'Employee App' using Ionic and Angular...",
                        "Built and optimized the 'Business App' in React Native...",
                        "Implemented real-time push notifications, offline support..."
                    ]
                },
                {
                    name: "Mobile Programming",
                    duration: "2024 - 2025",
                    position: "Senior Software Engineer",
                    pointers: [
                        "Promoted to Senior Software Engineer and currently leading a development team...",
                        "Designed and built retail and corporate banking web applications using MERN & .NET...",
                        "Architected and deployed multiple microservices for core banking modules..."
                    ]
                }
            ],
            skills: [
                "MERN/MEAN Stack",
                "Ionic",
                "C#/DotNet",
                "MongoDB",
                "SQL",
                "Project Management",
                "Agile / Scrum",
                "Team Leadership / Mentorship",
                "JIRA / Confluence",
                "CI/CD pipelines",
                "Docker / Containerization"
            ],
            education: [
                {
                    duration: "2020 - 2023",
                    name: "Chitkara University",
                    program: "Bachelor of Computer Application",
                    cgpa: "9.2 / 10.0"
                },
                {
                    duration: "2023 - 2025",
                    name: "Chandigarh University",
                    program: "Master of Computer Application",
                    cgpa: "9.0 / 10.0"
                }
            ],
            languages: ["Hindi", "English"]
        };

        const resume = await DeepResume.create(resumeData);

        // ✅ Step 3: Link resume to user
        newUser.cv = resume._id;
        await newUser.save();

        emitter.emit('log', {
            msg: `✅ User and resume seeded successfully | User ID: ${newUser._id} | Resume ID: ${resume._id}`,
            level: 'info',
        });

    } catch (e: any) {
        const error = e as AppError;
        const orgError = new AppError(error.stack, error.message, 500, seedUserWithResume.name, 'Server Error');
        emitter.emit('error', {
            msg: orgError.message,
            stack: orgError.stack!,
            level: orgError.level,
            code: error.statusCode,
            methodName: error.methodName
        });
    }
}

async function sendEmail({
    toEmail,
    subject,
    html
}: SendResetEmailOptions): Promise<{
    errorCode: "NO_ERROR" | 'SEM_EXPECTION'
}> {
    // Create transporter with your SMTP config (example using Gmail)
    const transporter = createTransport({
        host: 'smtp.gmail.com',   // replace with your SMTP server
        port: 465,
        secure: true,
        auth: {
            user: env.defaultEmail,  // set these env variables securely
            pass: env.email_pass
        }
    });

    const mailOptions = {
        from: env.defaultEmail,
        to: toEmail,
        subject,
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
        emitter.emit('log', {
            msg: 'Email sent to given email id',
            level: 'info'
        })
        return {
            errorCode: "NO_ERROR"
        }
    } catch (error: any) {
        emitter.emit('log', {
            msg: 'Email Expection Error' + `Failed to send password reset email to ${toEmail} due to this error ${error}`,
            level: 'fatal'
        })
        throw {
            errorCode: 'SEM_EXPECTION'
        };
    }
}

interface ModelMap {
    UserVault: IUserDocument;
    DeepResume: IUserDocument;
    blackBox:IUserDocument,
    pulseStream:IUserDocument
}

const getMongooseModel = <K extends keyof ModelMap>(name: K): Model<ModelMap[K]> => {
  const model = models[name];
  if (!model) {
    throw new Error(`Model ${name} not found`);
  }
  return model as unknown as Model<ModelMap[K]>; // ✅ safe cast
};


export {
    getMongooseModel,
    errorParser,
    errorGenerator,
    createToken,
    verifyToken,
    seedUserWithResume,
    sendEmail,
    generatePassword
};