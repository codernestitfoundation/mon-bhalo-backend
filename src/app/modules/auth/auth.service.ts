import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";


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
  
  const userTokens = createUserTokens(isUserExist);
  const { accessToken, refreshToken } = userTokens;

  return {
    accessToken,
    refreshToken,
    user: isUserExist
  };
};

const getNewAccessToken = async(refreshToken: string) => {

  const accessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

  return {
    accessToken
  };
};

export const AuthService = {
  credentialsLogin,
  getNewAccessToken
};
