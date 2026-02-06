import { Types } from "mongoose";

export enum Role {
  "USER" = "USER",
  "ADMIN" = "ADMIN",
  "SUPER_ADMIN" = "SUPER_ADMIN",
  "PSYCHOLOGIST" = "PSYCHOLOGIST",
}

export interface IAuthProvider {
  providerName: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: {
    firstName: string;
    lastName: string;
  };
  fullName?: string;
  email: string;
  gender?: Gender;
  dob?: Date;
  password?: string;
  role: Role;
  phoneNumber?: string;
  picture?: string;
  address?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  isActive?: IsActive;
  auths: IAuthProvider[];
}
