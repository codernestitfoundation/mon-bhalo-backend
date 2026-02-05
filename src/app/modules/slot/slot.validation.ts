import { z } from "zod";

export const createSlotSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    sessionFee: z.number(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time (HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time (HH:mm)"),
    sessionTime: z.number().min(20, "Session must be at least 20 minutes"),
    meditationTime: z.number().min(0)
});