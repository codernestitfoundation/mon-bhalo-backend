/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SlotServices } from "./slot.service";

const createSlots = catchAsync(async (req, res) => {
  const { id } = req.user as JwtPayload;
  const result = await SlotServices.createSlots(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Slots generated successfully",
    data: result,
  });
});

const getAllSlots = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload | undefined;
  const result = await SlotServices.getAllSlots(
    req.query as Record<string, string>,
    user?.id as string,
  );

  // If result is a single slot document (returned by slotId), send it directly
  if (result && (result as any)._id) {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Slot retrieved successfully",
      data: result,
    });
    return;
  }

  // Otherwise it's a paginated list
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Slots retrieved successfully",
    meta: (result as any).meta,
    data: (result as any).data,
  });
});

const deleteSlotsByDate = catchAsync(async (req, res) => {
  const { id } = req.user as JwtPayload;
  await SlotServices.deleteSlotsByDate(id, req.query.date as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Slots deleted successfully",
    data: null,
  });
});


const deleteSlotById = catchAsync(async (req, res) => {
  const { id: userId, role } = req.user as JwtPayload;
  const { id } = req.params;
  await SlotServices.deleteSlotById(
    userId as string,
    id as string,
    role as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Slot deleted successfully",
    data: null,
  });
});

export const SlotControllers = {
  createSlots,
  getAllSlots,
  deleteSlotsByDate,
  deleteSlotById,
}