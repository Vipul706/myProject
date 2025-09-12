import { AppError } from '../types/express-error';
import { models } from './../collections/index';
const { blackBox } = models
import type { LogLevel, ParsedError, SendResetEmailOptions } from "../types/types";
import { env } from '../config/envconfig';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { Model } from 'mongoose';
import type { IUserDocument } from '../types/model.type';
import { emitter } from './emiter';
import { createTransport } from 'nodemailer'

const secret = new TextEncoder().encode(env.JWTKEY);

async function errorParser(error: any, methodName: string, level: LogLevel = 'fatal', code: number = 500): Promise<ParsedError> {
    const err = await blackBox.findOne({ stack: error.stack, method: methodName })
    if (!err) {
        await blackBox.create({
            message: error.message || 'Error',
            method: methodName || errorParser.name,
            name: error.name || 'Server Error',
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

async function createToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(payload.isRm ? '7D' : '1D') // You can change this to '2h', '7d', etc.
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

// Models
const UserVault = models['UserVault'] as Model<IUserDocument>;
const DeepResume = models['DeepResume'] as Model<IUserDocument>;

async function seedUserWithResume() {
    const userData = {
        name: "Test User",
        email: "testuser@gmail.com", // Must match allowedDomains in your schema
        password: "securepassword123" // Will be hashed via pre-save hook
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

    } catch (error: any) {
        const err = new AppError(error.stack, error.message, 500, seedUserWithResume.name, 'Server Error');
        emitter.emit('error', {
            msg: err.message,
            err: err.stack,
            level: err.level,
            code: err.statusCode,
            methodName: err.methodName
        });
    }
}

// TODO:: Fix logs here 
export async function sendPasswordResetEmail({
    toEmail,
    resetLink,
    fromEmail = 'no-reply@yourapp.com',
    subject = 'YourApp Password Reset Request'
}: SendResetEmailOptions): Promise<void> {
    // Create transporter with your SMTP config (example using Gmail)
    const transporter = createTransport({
        host: 'smtp.gmail.com',   // replace with your SMTP server
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,  // set these env variables securely
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject,
        html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button above doesn’t work, copy and paste the following URL into your browser:</p>
        <p style="word-break: break-all;"><a href="${resetLink}" style="color: #007bff;">${resetLink}</a></p>
        <p>If you did not request a password reset, you can safely ignore this email. No changes were made to your account.</p>
        <p>Thank you,<br/>The YourApp Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you have any questions, reply to this email or contact our support team.</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Failed to send password reset email to ${toEmail}`, error);
        throw error;
    }
}

export {
    errorParser,
    errorGenerator,
    createToken,
    verifyToken,
    seedUserWithResume
};