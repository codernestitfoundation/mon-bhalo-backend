import { Types } from "mongoose";
import { IsActive } from "../user/user.interface";

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IEducation {
  degree: string;
  institute: string;
  year: string;
}


export interface IPsychologist {
  userId?: Types.ObjectId;
  specialization: string[];
  education: IEducation[]; 
  experience: number; 
  bio: string;
  sessionFee: number;
  documents?: string[];
  status?: ApplicationStatus;
  rating?: number;
  totalSessions?: number;
  isActive: IsActive; 
  isDeleted: boolean;
}