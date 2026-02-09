/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { formatDateForInvoice } from "../../utils/formatDate";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { SLOT_BOOKING_STATUS } from "../slot/slot.interface";
import { Slot } from "../slot/slot.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { IUser } from "../user/user.interface";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ bookingId : bookingId });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment Not Found. You have not booked this slot",
    );
  }

  const booking = await Booking.findById(payment.bookingId).populate("userId", "name email phoneNumber address");

  if (!booking) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Booking not found",
    );
  }

  const userAddress = (booking?.userId as any).address;
  const userEmail = (booking?.userId as any).email;
  const userPhoneNumber = (booking?.userId as any).phoneNumber;
  const userFirstName = (booking?.userId as any).name?.firstName || "";
  const userLastName = (booking?.userId as any).name?.lastName || "";
  const userName = `${userFirstName} ${userLastName}`.trim();

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId as string,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  };
};
const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.PAID,
      },
      { new: true, runValidators: true, session },
    );

    if (!updatedPayment) {
      throw new AppError(401, "Payment not found");
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.bookingId,
      { status: BOOKING_STATUS.CONFIRMED },
      { new: true, runValidators: true, session },
    )
      .populate("userId", "name email phoneNumber")
      .populate({
        path: "psychologistId",
        populate: { path: "userId", select: "name email phoneNumber" },
      })
      .populate("slotId", "date startTime endTime sessionFee");

    if (!updatedBooking) {
      throw new AppError(401, "Booking not found");
    }

    const slot = await Slot.findOneAndUpdate(
      { _id: updatedBooking.slotId },
      { slotBookingStatus: SLOT_BOOKING_STATUS.CONFIRMED },
      { new: true, session },
    );
    if (!slot) {
      throw new AppError(401, "Slot not found");
    }


    const userFirstName = (updatedBooking.userId as any)?.name?.firstName || "";
    const userLastName = (updatedBooking.userId as any)?.name?.lastName || "";
    const psychologistFirstName =
      (updatedBooking.psychologistId as any)?.userId?.name?.firstName || "";
    const psychologistLastName =
      (updatedBooking.psychologistId as any)?.userId?.name?.lastName || "";

    const invoiceData: IInvoiceData = {
      bookingId: updatedBooking._id?.toString(),
      bookingDate: formatDateForInvoice(updatedBooking.createdAt as Date),
      transactionId: updatedPayment.transactionId as string,
      userName: `${userFirstName} ${userLastName}`.trim(),
      userEmail: (updatedBooking.userId as any)?.email,
      userPhoneNumber: (updatedBooking.userId as any)?.phoneNumber,
      psychologistName: `${psychologistFirstName} ${psychologistLastName}`.trim(),
      psychologistEmail:
        (updatedBooking.psychologistId as any)?.userId?.email || "",
      slotDate: slot?.date || (updatedBooking.slotId as any)?.date,
      startTime: slot?.startTime || (updatedBooking.slotId as any)?.startTime,
      endTime: slot?.endTime || (updatedBooking.slotId as any)?.endTime,
      sessionFee: updatedPayment.amount,
    };

    const pdfBuffer = await generatePdf(invoiceData);

    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice",
    );
    // console.log("Cloudinary Result:", cloudinaryResult);

    if (!cloudinaryResult) {
      throw new AppError(401, "Error uploading pdf");
    }

    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      { invoiceUrl: cloudinaryResult.secure_url },
      { runValidators: true, session },
    );

    await sendEmail({
      to: (updatedBooking.userId as unknown as IUser).email,
      subject: "Your Booking Invoice",
      templateName: "invoice",
      templateData: invoiceData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};
const failPayment = async (query: Record<string, string>) => {
  // Update Booking Status to FAIL
  // Update Payment Status to FAIL
  // Revert Slot status to AVAILABLE

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.FAILED,
      },
      { new: true, runValidators: true, session: session },
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.bookingId,
      { status: BOOKING_STATUS.FAILED },
      { new: true, runValidators: true, session },
    );

    // Revert Slot status to AVAILABLE
    if (updatedBooking?.slotId) {
      await Slot.findByIdAndUpdate(
        updatedBooking.slotId,
        { slotBookingStatus: SLOT_BOOKING_STATUS.AVAILABLE },
        { new: true, session },
      );
    }

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: false, message: "Payment Failed" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};
const cancelPayment = async (query: Record<string, string>) => {
  // Update Booking Status to CANCEL
  // Update Payment Status to CANCEL
  // Revert Slot status to AVAILABLE

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.CANCELLED,
      },
      { runValidators: true, session: session },
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.bookingId,
      { status: BOOKING_STATUS.CANCEL },
      { new: true, runValidators: true, session },
    );

    // Revert Slot status to AVAILABLE
    if (updatedBooking?.slotId) {
      await Slot.findByIdAndUpdate(
        updatedBooking.slotId,
        { slotBookingStatus: SLOT_BOOKING_STATUS.AVAILABLE },
        { new: true, session },
      );
    }

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: false, message: "Payment Cancelled" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");

  if (!payment) {
    throw new AppError(401, "Payment not found");
  }

  if (!payment.invoiceUrl) {
    throw new AppError(401, "No invoice found");
  }

  return payment.invoiceUrl;
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
};
