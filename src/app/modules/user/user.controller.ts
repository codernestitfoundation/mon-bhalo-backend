import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { UserServices } from './user.service';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserServices.createUser(req.body);

        res.status(httpStatus.CREATED).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }
}
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserServices.getUsers();

        res.status(httpStatus.OK).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });

    } catch (error) {
        next(error);
    }
}

export const UserControllers = {
    createUser,
    getUsers
}
