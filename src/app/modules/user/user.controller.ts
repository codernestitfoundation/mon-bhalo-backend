/* eslint-disable @typescript-eslint/no-unused-vars */

import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { UserServices } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

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
    getAllUsers
}
