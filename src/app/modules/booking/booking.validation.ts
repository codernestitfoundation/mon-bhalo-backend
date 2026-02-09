import { z } from "zod";
import { BOOKING_STATUS } from "./booking.interface";


export const updateBookingStatusZodSchema = z.object({
    status: z.enum(Object.values(BOOKING_STATUS) as [string]),
});
