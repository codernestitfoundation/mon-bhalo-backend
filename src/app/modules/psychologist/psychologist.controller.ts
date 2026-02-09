/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PsychologistServices } from "./psychologist.service";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { IPsychologist } from "./psychologist.interface";

const applyAsPsychologist = catchAsync(async (req:Request, res:Response, next: NextFunction) => {
   
    const payload:IPsychologist = {
      ...req.body,
      documents: await (req.files as Express.Multer.File[]).map(file=>file.path)

    }
    const {id} = req.user as JwtPayload
  const result = await PsychologistServices.applyAsPsychologist(id as string, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Application submitted successfully",
    data: result,
  });
});

const approvePsychologist = catchAsync(async (req:Request, res:Response, next: NextFunction) => {
  const { id } = req.params;
  const result = await PsychologistServices.approvePsychologist(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Psychologist approved successfully",
    data: result,
  });
});

const getAllPsychologists = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await PsychologistServices.getAllPsychologists();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Psychologists retrieved successfully",
    data: result,
  });
});

const updatePsychologist = catchAsync(async (req:Request, res:Response, next: NextFunction) => {
  const id = req.params.id
  const payload: IPsychologist = {
        ...req.body,
        images: (req.files as Express.Multer.File[])?.map(file => file.path)
    }
  const result = await PsychologistServices.updatePsychologist(id as string, payload, req.user as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

const deletePsychologist = catchAsync(async (req:Request, res:Response, next: NextFunction) => {
  const { id } = req.params;
  await PsychologistServices.deletePsychologist(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Psychologist profile deleted successfully",
    data: null,
  });
});


export const PsychologistControllers = {
  applyAsPsychologist,
  approvePsychologist,
  getAllPsychologists,
  updatePsychologist,
  deletePsychologist,
};