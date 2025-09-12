import type { Types } from "mongoose";
import type { CvData } from "../controller/cvTemplate/types";

interface IUser {
    name: string;
    email: string;
    password: string;
    createdAt?: Date;
    prCounter:number;
    lastPasswordResetAt:Date;
    token:string;
    cv?: Types.ObjectId | CvData;
}
interface IUserDocument extends IUser, Document { }

export type {
    IUserDocument,
    IUser
}