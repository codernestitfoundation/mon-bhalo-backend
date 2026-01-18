import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema <IAuthProvider>({
    providerName: { type: String, required: true },
    providerId: { type: String, required: true },
},{
    versionKey: false,
    _id: false,
});


const userSchema = new Schema<IUser>({
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
    },
    email: { type: String, required: true, unique: true },
    dob: { type: Date },
    password: { type: String },
    role: { 
        type: String, 
        enum: Object.values(Role), 
        required: true,
        default: Role.USER
        },
    phoneNumber: { type: String },
    picture: { type: String },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isActive: { 
        type: String, 
        enum: Object.values(IsActive), 
        default: IsActive.ACTIVE },
    auths: [authProviderSchema],
    appointment: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    psychologist: [{ type: Schema.Types.ObjectId, ref: "Psychologist" }],
}, {
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema);