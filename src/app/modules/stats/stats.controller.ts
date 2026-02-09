// controllers/stats.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatsService } from "./stats.service";

const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getUserStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User stats fetched successfully",
        data: stats,
    });
});

const getPsychologistStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getPsychologistStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Psychologist stats fetched successfully",
        data: stats,
    });
});

const getSlotStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getSlotStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Slot stats fetched successfully",
        data: stats,
    });
});

const getBookingStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getBookingStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking stats fetched successfully",
        data: stats,
    });
});

const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getPaymentStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment stats fetched successfully",
        data: stats,
    });
});

// Optional: A combined dashboard for a single API call
const getAdminDashboardOverview = catchAsync(async (req: Request, res: Response) => {
    const [users, psychologists, slots, bookings, payments] = await Promise.all([
        StatsService.getUserStats(),
        StatsService.getPsychologistStats(),
        StatsService.getSlotStats(),
        StatsService.getBookingStats(),
        StatsService.getPaymentStats(),
    ]);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin dashboard overview fetched successfully",
        data: { users, psychologists, slots, bookings, payments },
    });
});

export const StatsController = {
    getUserStats,
    getPsychologistStats,
    getSlotStats,
    getBookingStats,
    getPaymentStats,
    getAdminDashboardOverview,
};