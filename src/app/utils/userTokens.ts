import httpStatus from 'http-status-codes';
import { envVars } from "../config/env";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import AppError from '../errorHelpers/AppError';
import { JwtPayload } from 'jsonwebtoken';

export const createUserTokens = (user: Partial<IUser>) => {
 
  const jwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
  const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET as string, envVars.JWT_REFRESH_EXPIRES as string);

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken : string) =>{

    const verifiedToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET as string) as JwtPayload;

 const isUserExist = await User.findOne({ email: verifiedToken.email })

  if(!isUserExist){
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deleted");
  }
  if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, `User account is ${isUserExist.isActive}. Please contact our support team.`);
  }

 const jwtPayload = {
    id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);


  return accessToken
}