import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";

const createUser = async (payload : Partial<IUser>) => {
    const {email , password, ...rest} = payload;

    const isUserExist = await User.findOne({email});
    if(isUserExist){
        throw new AppError('User already exists', httpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password as string, 10);
    payload.password = hashedPassword;

    const authProvider : IAuthProvider = {
        providerName: "credential",
        providerId: email as string
    }
    payload.auths = [authProvider];

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider], 
        ...rest
    });
    
    return user
}

const getAllUsers = async ()=> {
    const users = await User.find();

    const totalUsers = await User.countDocuments();
    
    const data = {
        users,
        meta: {
            total: totalUsers
        }
    }
 return data;  
}


export const UserServices = {
    createUser,
    getAllUsers
}