import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { IsActive, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { ApplicationStatus, IPsychologist } from "./psychologist.interface";
import { Psychologist } from "./psychologist.model";

const applyAsPsychologist = async (userId: string, payload: IPsychologist) => {
  const isExist = await Psychologist.findOne({ userId });
  if (isExist) {
    throw new AppError(httpStatus.CONFLICT, "You have already applied!");
  }

  const result = await Psychologist.create({ ...payload, userId });
  return result;
};

const approvePsychologist = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await Psychologist.findByIdAndUpdate(
      id,
      { status: ApplicationStatus.APPROVED, isActive: IsActive.ACTIVE },
      { session, new: true },
    );

    if (!profile) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Psychologist profile not found",
      );
    }

    // 2. Update the User's role to PSYCHOLOGIST
    const userUpdate = await User.findByIdAndUpdate(
      profile.userId,
      { role: Role.PSYCHOLOGIST },
      { session },
    );

    if (!userUpdate) {
      throw new AppError(httpStatus.NOT_FOUND, "Associated User not found");
    }

    await session.commitTransaction();
    session.endSession();

    const populatedResult = await profile.populate({
      path: "userId",
      select: "-password -auths -isDeleted",
    });

    return populatedResult;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllPsychologists = async () => {
  // const psychologists = await Psychologist.find({ status: ApplicationStatus.APPROVED })
  const psychologists = await Psychologist.find({
    status: ApplicationStatus.APPROVED,
    isActive: IsActive.ACTIVE,
    isDeleted: false,
  }).populate({
    path: "userId",
    select: "-password -auths -isDeleted",
  });

  const totalPsychologist = await Psychologist.countDocuments();

  const data = {
    psychologists,
    meta: {
      total: totalPsychologist,
    },
  };
  return data;
};

const updatePsychologist = async (
  id: string,
  payload: Partial<IPsychologist>,
  decodedToken: JwtPayload,
) => {
  const isPsychologistExist = await Psychologist.findById(id);
  if (!isPsychologistExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Psychologist profile not found");
  }

  const isAdmin =
    decodedToken.role === Role.ADMIN || decodedToken.role === Role.SUPER_ADMIN;
  const isOwner = isPsychologistExist.userId == decodedToken.id;

  if (!isAdmin && !isOwner) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to update this profile",
    );
  }
  if (payload.isDeleted || payload.status) {
    {
      if (!isAdmin) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Your are not authorized to update this field",
        );
      }
    }
  }
  const result = await Psychologist.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deletePsychologist = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await Psychologist.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        isActive: false,
        status: ApplicationStatus.REJECTED,
      },
      { new: true, session },
    );

    if (!profile) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Psychologist profile not found",
      );
    }
    const userUpdate = await User.findByIdAndUpdate(
      profile.userId,
      { role: Role.USER },
      { session },
    );

    if (!userUpdate) {
      throw new AppError(httpStatus.NOT_FOUND, "Associated User not found");
    }

    await session.commitTransaction();
    session.endSession();

    return profile;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const PsychologistServices = {
  applyAsPsychologist,
  approvePsychologist,
  getAllPsychologists,
  updatePsychologist,
  deletePsychologist,
};
