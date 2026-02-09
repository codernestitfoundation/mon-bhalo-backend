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
    console.log("Payment URL:", sslPayment.GatewayPageURL);
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

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
