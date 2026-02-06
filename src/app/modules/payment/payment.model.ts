import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS, } from "./payment.interface";

const paymentSchema = new Schema<IPayment>({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.UNPAID },
    transactionId: { type: String },
    paymentGatewayData: { type: Schema.Types.Mixed },
    invoiceUrl: { type: String },
},{
    timestamps: true,
    versionKey: false,
 })

export const Payment = model<IPayment>("Payment", paymentSchema);