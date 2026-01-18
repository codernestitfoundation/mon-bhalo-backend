/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode= 500;
    let message = "Something went wrong!"

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof Error) {
        statusCode = 500;
        message = error.message;
    }
 
    res.status(statusCode).json({
        success: false,
        message,
        error,
        stack: envVars.NODE_ENV === 'development' ? error.stack : null,
    });

}