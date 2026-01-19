import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { envVars } from "../../config/env";
import jwt, { SignOptions } from "jsonwebtoken";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deleted");
  }

  if (isUserExist.isActive === IsActive.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked. Please contact our support team.");
  }
  if(isUserExist.isVerified === false){
    throw new AppError(httpStatus.FORBIDDEN, "User email is not verified. Please verify your email to proceed.");
  }

  const isPasswordMatched = await bcrypt.compare(
    password as string,
    isUserExist.password as string,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

    const jwtPayload = {
    id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: envVars.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
  });

  return {
    accessToken,
  };
};

export const AuthService = {
  credentialsLogin,
};
