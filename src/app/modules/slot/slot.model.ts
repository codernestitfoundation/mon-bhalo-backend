import { Schema, model } from "mongoose";
import { ISlot } from "./slot.interface";

const slotSchema = new Schema<ISlot>(
  {
    psychologistId: { type: Schema.Types.ObjectId, ref: "Psychologist", required: true },
    date: { type: String, required: true },
    sessionFee: { type: Number, required: true},
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    sessionTime: { type: Number, required: true },
    meditationTime: { type: Number, default: 0 },
    isBooked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    versionKey: false
   }
);

export const Slot = model<ISlot>("Slot", slotSchema);