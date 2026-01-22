/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS),
  );
  payload.password = hashedPassword;

  const authProvider: IAuthProvider = {
    providerName: "credentials",
    providerId: email as string,
  };
  payload.auths = [authProvider];

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  const {password: pwd, ...userData} = user.toObject();

  return userData;
};



const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {



    if (decodedToken.role === Role.USER || decodedToken.role === Role.PSYCHOLOGIST) {
        if (userId !== decodedToken.id) {
            throw new AppError(401, "You are not authorized 1")
        }
    }

    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if (decodedToken.role === Role.ADMIN && isUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(401, "You are not authorized")
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.PSYCHOLOGIST) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.PSYCHOLOGIST) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    const {password, ...userData} = newUpdatedUser!.toObject();

    return userData
}



const getAllUsers = async () => {
  const users = await User.find();

  const totalUsers = await User.countDocuments();

  const data = {
    users,
    meta: {
      total: totalUsers,
    },
  };
  return data;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
};
