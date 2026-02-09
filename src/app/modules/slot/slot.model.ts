import { Schema, model } from "mongoose";
import { ISlot, SLOT_BOOKING_STATUS } from "./slot.interface";

const slotSchema = new Schema<ISlot>(
  {
    psychologistId: { type: Schema.Types.ObjectId, ref: "Psychologist", required: true },
    date: { type: String, required: true },
    sessionFee: { type: Number, required: true},
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    sessionTime: { type: Number, required: true },
    meditationTime: { type: Number, default: 0 },
    slotBookingStatus: {type: String, 
                enum: Object.values(SLOT_BOOKING_STATUS), 
                default: SLOT_BOOKING_STATUS.AVAILABLE },
    isDeleted: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    versionKey: false
   }
);

export const Slot = model<ISlot>("Slot", slotSchema);