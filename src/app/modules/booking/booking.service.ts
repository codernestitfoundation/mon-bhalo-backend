/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { getTransactionId } from "../../utils/getTransactionId";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Slot } from "../slot/slot.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { SLOT_BOOKING_STATUS } from "../slot/slot.interface";
import mongoose from "mongoose";
import { Psychologist } from "../psychologist/psychologist.model";

const createBooking = async (
  payload: Partial<IBooking>,
  userId: string,
  slotIdParam?: string,
  psychologistIdParam?: string,
) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.phoneNumber || !user.address) {
      const missing = [];
      if (!user.phoneNumber) missing.push("phoneNumber");
      if (!user.address) missing.push("address");
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Please update your profile. Missing: ${missing.join(", ")}`,
      );
    }

    const slotId =
      (slotIdParam as string) || (payload.slotId as unknown as string);
    const psychologistId =
      (psychologistIdParam as string) ||
      (payload.psychologistId as unknown as string);

    const slot = await Slot.findById(slotId);
    if (!slot) {
      throw new AppError(httpStatus.BAD_REQUEST, "Slot not found");
    }
    if (slot.slotBookingStatus !== SLOT_BOOKING_STATUS.AVAILABLE) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Slot is not available for booking.",
      );
    }

    const amount = slot.sessionFee || 0;

    const bookingDocs = await Booking.create(
      [
        {
          userId: userId as string,
          psychologistId: psychologistId as string,
          slotId: slotId as string,
          status: BOOKING_STATUS.PENDING,
        },
      ],
      { session },
    );

    const bookingDoc = bookingDocs[0];

    const paymentDocs = await Payment.create(
      [
        {
          bookingId: bookingDoc._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId: transactionId,
          amount,
        },
      ],
      { session },
    );

    const paymentDoc = paymentDocs[0];

    await Slot.findByIdAndUpdate(
      slotId,
      { slotBookingStatus: SLOT_BOOKING_STATUS.BOOKED },
      { new: true, session },
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingDoc._id,
      { paymentId: paymentDoc._id },
      { new: true, runValidators: true, session },
    )
      .populate("userId", "name email phoneNumber address")
      .populate("psychologistId", "name")
      .populate("slotId", "date sessionFee startTime endTime")
      .populate("paymentId")
      .populate({
        path: "psychologistId",
        populate: { path: "userId", select: "name email phoneNumber address" },
      });

    const populatedUser = (updatedBooking?.userId as any) || {};
    const userAddress = populatedUser.address;
    const userEmail = populatedUser.email;
    const userPhoneNumber = populatedUser.phoneNumber;
    const userName =
      populatedUser.fullName ||
      `${populatedUser?.name?.firstName || ""} ${populatedUser?.name?.lastName || ""}`.trim();

    const sslPayload: ISSLCommerz = {
      address: userAddress || "",
      email: userEmail || "",
      phoneNumber: userPhoneNumber || "",
      name: userName || "",
      amount,
      transactionId: transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();
    // console.log("Payment URL:", sslPayment.GatewayPageURL);
    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    }; 


  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getUserBookings = async () => {
  return {};
};

const getBookingById = async () => {
  return {};
};

const updateBookingStatus = async () => {
  return {};
};

const getAllBookings = async () => {
  return {};
};



const completeBookingAndRate = async (
  bookingId: string, 
  rating: number, 
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the booking and verify ownership/status
    const booking = await Booking.findOne({ _id: bookingId, userId }).session(session);
    
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found or unauthorized");
    }
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError(httpStatus.BAD_REQUEST, "This session has already been rated");
    }

    // 2. Update Booking Status
    await Booking.findByIdAndUpdate(
      bookingId, 
      { status: BOOKING_STATUS.COMPLETED }, 
      { session }
    );

    // 3. Update Psychologist Rating & Session Count
    const psychologist = await Psychologist.findById(booking.psychologistId).session(session);
    if (!psychologist) throw new AppError(httpStatus.NOT_FOUND, "Psychologist not found");

    if (rating < 1 || rating > 5) {
      throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    const currentTotal = psychologist.totalSessions || 0;
    const currentRating = psychologist.rating || 0;
    const newAverage = (currentRating * currentTotal + rating) / (currentTotal + 1);

    await Psychologist.findByIdAndUpdate(
      booking.psychologistId,
      {
        rating: Number(newAverage.toFixed(1)),
        $inc: { totalSessions: 1 }
      },
      { session, runValidators: true }
    );

    await session.commitTransaction();
    return { message: "Session completed and rating submitted" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
  completeBookingAndRate
};
