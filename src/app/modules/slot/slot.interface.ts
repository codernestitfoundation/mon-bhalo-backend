import { Types } from "mongoose";

export enum SLOT_BOOKING_STATUS {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  CONFIRM = "CONFIRM",
  CANCELLED = "CANCELLED"
}

export interface ISlot {
  psychologistId: Types.ObjectId;
  date: string; 
  sessionFee: number;
  startTime: string; 
  endTime: string; 
  sessionTime: number;    
  meditationTime: number;
  slotBookingStatus: SLOT_BOOKING_STATUS;
  isDeleted?: boolean;
}