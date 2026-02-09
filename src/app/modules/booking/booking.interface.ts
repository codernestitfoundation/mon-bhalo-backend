import { Types } from "mongoose";

export enum BOOKING_STATUS {
    PENDING = "PENDING",
    CANCEL = "CANCEL",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
}

export interface IBooking {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    psychologistId: Types.ObjectId;
    paymentId?: Types.ObjectId;
    slotId: Types.ObjectId;
    status: BOOKING_STATUS;
    createdAt?: Date;
    updatedAt?: Date;
}