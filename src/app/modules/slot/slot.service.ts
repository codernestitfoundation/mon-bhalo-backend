import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Psychologist } from "../psychologist/psychologist.model";
import { ISlot, SLOT_BOOKING_STATUS } from "./slot.interface";
import { Slot } from "./slot.model";
import { generateTimeSlots } from "./slot.utils";

const createSlots = async (userId: string, payload: Partial<ISlot>) => {
  const { date, startTime, endTime, sessionTime, meditationTime, sessionFee } =
    payload;

  const psychologist = await Psychologist.findOne({ userId });

  if (!psychologist) {
    throw new AppError(httpStatus.NOT_FOUND, "Psychologist profile not found.");
  }

  if (psychologist.status === "PENDING") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your profile is pending admin approval.",
    );
  }

  if (psychologist.isActive === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked as Psychologist. Please contact support.",
    );
  }

  if (psychologist.isActive === "INACTIVE") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your Psychologist Profile is inactive. Please activate it to create slots.",
    );
  }

  const today = new Date().toISOString().split("T")[0];
  if ((date as string) < today) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot create slots for past dates.",
    );
  }

  const overlappingSlot = await Slot.findOne({
    psychologistId: userId,
    date,
    $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }],
  });

  if (overlappingSlot) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Conflict! You already have slots created between ${overlappingSlot.startTime} and ${overlappingSlot.endTime} on this date.`,
    );
  }

  // 5. Generate Intervals
  const intervals = generateTimeSlots(
    date as string,
    startTime as string,
    endTime as string,
    sessionTime as number,
    meditationTime as number,
  );

  if (intervals.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "The time range provided is too short for the session duration.",
    );
  }

  // 6. Fee Logic
  const finalFee = sessionFee ?? psychologist.sessionFee ?? 0;

  // 7. Prepare and Insert
  const slotsData = intervals.map((item) => ({
    psychologistId: psychologist._id,
    date,
    startTime: item.startTime,
    endTime: item.endTime,
    sessionTime,
    meditationTime,
    sessionFee: finalFee,
  }));

  return await Slot.insertMany(slotsData);
};

const getAllSlots = async (query: Record<string, string>, userId?: string) => {
 
  // If a specific slot id is supplied, return that single slot
  const slotId = (query.id ?? query.slotId) as string | undefined;
  if (slotId) {
    return await getSlotById(slotId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { isDeleted: false };

  // Support psychologistId filter. If frontend sends 'me', resolve to current psychologist
  if (query.psychologistId) {
    if (query.psychologistId === "me") {
      if (!userId) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User context required for 'me' psychologistId.",
        );
      }
      const psychologist = await Psychologist.findOne({ userId });
      if (!psychologist) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "Psychologist profile not found.",
        );
      }
      filter.psychologistId = psychologist._id;
    } else {
      filter.psychologistId = query.psychologistId;
    }
  }

  // Optional date filter
  if (query.date) filter.date = query.date;

  const slotQuery = new QueryBuilder(
    Slot.find(filter).populate({
      path: "psychologistId",
      populate: { path: "userId" },
    }),
    query,
  );

  const slots = await slotQuery
    .search(["date", "startTime", "endTime"])
    .paginate();

  const [data, meta] = await Promise.all([slots.build(), slotQuery.getMeta()]);

  return { data, meta };
};

const deleteSlotsByDate = async (userId: string, date: string) => {
  const psychologist = await Psychologist.findOne({ userId });
  const booked = await Slot.findOne({
    psychologistId: psychologist?._id,
    date,
    isBooked: true,
  });

  if (booked)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete slots with active bookings.",
    );
  return await Slot.deleteMany({ psychologistId: psychologist?._id, date });
};



const getSlotById = async (slotId: string) => {
  const slot = await Slot.findOne({ _id: slotId, isDeleted: false }).populate({
    path: "psychologistId",
    populate: { path: "userId" },
  });

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, "Slot not found.");
  }

  return slot;
};

const deleteSlotById = async (
  userId: string,
  slotId: string,
  userRole?: string,
) => {
  const slot = await Slot.findOne({ _id: slotId, isDeleted: false });

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, "Slot not found.");
  }

  if (slot.slotBookingStatus === SLOT_BOOKING_STATUS.CONFIRM) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete a booked slot.");
  }

  // Allow admins to delete any slot
  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    return await Slot.deleteOne({ _id: slotId });
  }

  // Psychologist can only delete own slot
  const psychologist = await Psychologist.findOne({ userId });
  if (
    !psychologist ||
    psychologist._id.toString() !== slot.psychologistId.toString()
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to delete this slot.",
    );
  }

  return await Slot.deleteOne({ _id: slotId });
};


export const SlotServices = {
  createSlots,
  deleteSlotsByDate,
  deleteSlotById,
  getAllSlots,
};
