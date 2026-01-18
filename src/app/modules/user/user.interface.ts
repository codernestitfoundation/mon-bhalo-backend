import { Types } from "mongoose";

export enum  Role {
    "USER"= 'USER',
    "ADMIN"= 'ADMIN',
    "SUPER_ADMIN"= 'SUPER_ADMIN',
    "PSYCHOLOGIST"= 'PSYCHOLOGIST'
}

export interface IAuthProvider {
    providerName: string;
    providerId: string;
}

export enum IsActive {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'
}

export interface IUser {
    name: {
        firstName: string;
        lastName: string;
    };
    email: string;
    dob?: Date;
    password?: string;
    role: Role;
    phoneNumber?: string;
    picture?: string;
    address?: string;
    isVerified?: boolean;
    isDeleted?: boolean;
    isActive?: IsActive;
    appointment?: Types.ObjectId[];
    auths : IAuthProvider[]
    psychologist?: Types.ObjectId[];
}