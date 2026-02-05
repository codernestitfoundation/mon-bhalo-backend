import { Types } from "mongoose";

export interface ISlot {
  psychologistId: Types.ObjectId;
  date: string; 
  sessionFee: number;
  startTime: string; 
  endTime: string; 
  sessionTime: number;    
  meditationTime: number;
  isBooked?: boolean;
  isDeleted?: boolean;
}