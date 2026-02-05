import { Schema, model } from "mongoose";
import { ApplicationStatus, IPsychologist } from "./psychologist.interface";
import { IsActive } from "../user/user.interface";

const educationSchema = new Schema({
  degree: { type: String, required: true },
  institute: { type: String, required: true },
  year: { type: String, required: true },
},{
  _id: false,
  timestamps: false
});

const psychologistSchema = new Schema<IPsychologist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    specialization: { type: [String], required: true },
    education: { type: [educationSchema], required: true },
    experience: { type: Number, required: true },
    bio: { type: String, required: true },
    sessionFee: { type: Number, required: true },
    documents: { type: [String] },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    rating: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
     isActive: { 
            type: String, 
            enum: Object.values(IsActive), 
            default: IsActive.INACTIVE },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true,
    versionKey: false
   }
);

export const Psychologist = model<IPsychologist>("Psychologist", psychologistSchema,);
