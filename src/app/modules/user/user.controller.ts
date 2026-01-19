/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */

import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { UserServices } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const createUser = catchAsync (async (req: Request, res: Response, next: NextFunction) => {
   
        const user = await UserServices.createUser(req.body);

        const {password, ...userData} = user.toObject();

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "User created successfully",
            data: userData
        })
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const userId = req.params.id;
    const verifiedToken = req.user;

    const payload = req.body;
    const user = await UserServices.updateUser(userId as string, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user,
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        meta: result.meta,
        data: result.users
    })
})

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
}
