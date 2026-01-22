/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  const isPasswordMatched = await bcrypt.compare(
    password as string,
    isUserExist?.password as string,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const userTokens = createUserTokens(isUserExist!);
  const { accessToken, refreshToken } = userTokens;

  return {
    accessToken,
    refreshToken,
    user: isUserExist,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const accessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken,
  };
};

const resetPassword = async (oldPassword : string, newPassword : string, decodedToken: JwtPayload) =>{

  const user = await User.findById(decodedToken.id)

  const isOldPasswordMatch = await bcrypt.compare(oldPassword, user!.password as string)

  if(!isOldPasswordMatch){
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match")
  }

  user!.password = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUNDS))

  user!.save()
}

export const AuthService = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
