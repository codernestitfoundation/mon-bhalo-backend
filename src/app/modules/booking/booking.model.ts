import { model, Schema } from "mongoose";
import { BOOKING_STATUS, IBooking } from "./booking.interface";


const bookingSchema = new Schema<IBooking>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    psychologistId: { type: Schema.Types.ObjectId, ref: "Psychologist", required: true },  
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
},{
    timestamps: true,
    versionKey: false,
});

export const Booking = model<IBooking>("Booking", bookingSchema);
