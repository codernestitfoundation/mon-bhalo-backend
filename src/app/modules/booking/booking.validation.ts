import { z } from "zod";
import { BOOKING_STATUS } from "./booking.interface";


export const updateBookingStatusZodSchema = z.object({
    status: z.enum(Object.values(BOOKING_STATUS) as [string]),
});

export const createBookingZodSchema = z.object({
    slotId: z.string().min(1),
    psychologistId: z.string().min(1),
});
