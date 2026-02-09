/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS {
    PAID = "PAID",
    UNPAID = "UNPAID",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}


export interface IPayment {
    bookingId: Types.ObjectId;
    amount: number;
    status: PAYMENT_STATUS;
    transactionId?: string;
    paymentGatewayData?: any; // Store raw data from the payment gateway for reference
    invoiceUrl?: string; 
}