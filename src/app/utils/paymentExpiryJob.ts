import { BOOKING_STATUS } from "../modules/booking/booking.interface";
import { Booking } from "../modules/booking/booking.model";
import { PAYMENT_STATUS } from "../modules/payment/payment.interface";
import { Payment } from "../modules/payment/payment.model";
import { SLOT_BOOKING_STATUS } from "../modules/slot/slot.interface";
import { Slot } from "../modules/slot/slot.model";

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const CHECK_INTERVAL_MS = 2 * 60 * 1000; // run every 2 minutes

const processExpiredPayments = async () => {

  const cutoff = new Date(Date.now() - EXPIRY_MS);

  // Find expired payments that are unpaid, failed, cancelled, or refunded
  const expiredPayments = await Payment.find({
    status: {
      $in: [
        PAYMENT_STATUS.UNPAID,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.CANCELLED,
        PAYMENT_STATUS.REFUNDED,
      ],
    },
    createdAt: { $lt: cutoff },
  }).lean();

  for (const p of expiredPayments) {
    const session = await Payment.startSession();
    session.startTransaction();
    try {
      const freshPayment = await Payment.findById(p._id).session(session);
      
      if (
        !freshPayment ||
        ![
          PAYMENT_STATUS.UNPAID,
          PAYMENT_STATUS.FAILED,
          PAYMENT_STATUS.CANCELLED,
          PAYMENT_STATUS.REFUNDED,
        ].includes(freshPayment.status)
      ) {
        await session.abortTransaction();
        session.endSession();
        continue;
      }

      const booking = await Booking.findById(freshPayment.bookingId).session(
        session,
      );
      if (!booking) {
        await session.abortTransaction();
        session.endSession();
        continue;
      }
      
      if (freshPayment.status !== PAYMENT_STATUS.FAILED) {
        await Payment.findByIdAndUpdate(
          freshPayment._id,
          { status: PAYMENT_STATUS.FAILED },
          { session },
        );
      }

      // Only update booking status if it's not already FAILED
      if (booking.status !== BOOKING_STATUS.FAILED) {
        await Booking.findByIdAndUpdate(
          booking._id,
          { status: BOOKING_STATUS.FAILED },
          { session },
        );
      }

      // Release the slot to AVAILABLE
      await Slot.findByIdAndUpdate(
        booking.slotId,
        { slotBookingStatus: SLOT_BOOKING_STATUS.AVAILABLE },
        { session },
      );

      await session.commitTransaction();
      session.endSession();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
    }
  }
};

export const startPaymentExpiryJob = () => {
  // run once immediately
  void processExpiredPayments();
  // schedule periodic runs
  setInterval(() => void processExpiredPayments(), CHECK_INTERVAL_MS);
};
