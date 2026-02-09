/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Slot } from "../slot/slot.model";
import { Psychologist } from "../psychologist/psychologist.model";
import { User } from "../user/user.model";
import { IsActive } from "../user/user.interface";

// Utility to get Date objects for filtering
const getPastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const getUserStats = async () => {
  const [
    totalUsers,
    totalActiveUsers,
    totalBlockedUsers,
    totalInActiveUsers,
    totalMaleUsers,
    totalFemaleUsers,
    newUsers7Days,
    newUsers30Days,
    usersByRole
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: IsActive.ACTIVE }),
    User.countDocuments({ isActive: IsActive.BLOCKED }),
    User.countDocuments({ isActive: IsActive.INACTIVE }),
    User.countDocuments({ gender: "MALE" }),
    User.countDocuments({ gender: "FEMALE" }),
    User.countDocuments({ createdAt: { $gte: getPastDate(7) } }),
    User.countDocuments({ createdAt: { $gte: getPastDate(30) } }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
  ]);

  return { totalUsers, totalActiveUsers, totalBlockedUsers, totalInActiveUsers, totalMaleUsers, totalFemaleUsers, newUsers7Days, newUsers30Days, usersByRole };
};

const getPsychologistStats = async () => {
  const [
    totalPsychologists,
    activePsychologists,
    blockedPsychologists,
    inactivePsychologists,
    approvedPsychologists,
    pendingPsychologists,
    rejectedPsychologists,
    avgRating
  ] = await Promise.all([
    Psychologist.countDocuments({ isDeleted: false }),
    Psychologist.countDocuments({ isActive: IsActive.ACTIVE }),
    Psychologist.countDocuments({ isActive: IsActive.BLOCKED }),
    Psychologist.countDocuments({ isActive: IsActive.INACTIVE }),
    Psychologist.countDocuments({ status: "APPROVED" }),
    Psychologist.countDocuments({ status: "PENDING" }),
    Psychologist.countDocuments({ status: "REJECTED" }), 
    Psychologist.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }])
  ]);

  return {
    totalPsychologists,
    activePsychologists,
    blockedPsychologists,
    inactivePsychologists,
    approvedPsychologists,
    pendingPsychologists,
    rejectedPsychologists,
    averageRating: avgRating[0]?.avg || 0
  };
};

const getSlotStats = async () => {
  const [
    totalSlots,
    bookingStatusStats,
    avgSessionFee
  ] = await Promise.all([
    Slot.countDocuments({ isDeleted: false }),
    Slot.aggregate([{ $group: { _id: "$slotBookingStatus", count: { $sum: 1 } } }]),
    Slot.aggregate([{ $group: { _id: null, avgFee: { $avg: "$sessionFee" } } }])
  ]);

  return { 
    totalSlots, 
    bookingStatusStats, 
    averageSessionFee: avgSessionFee[0]?.avgFee || 0 
  };
};

const getBookingStats = async () => {
  const [
    totalBookings,
    statusStats,
    bookings7Days,
    mostBookedPsychologists
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Booking.countDocuments({ createdAt: { $gte: getPastDate(7) } }),
    Booking.aggregate([
      { $group: { _id: "$psychologistId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "psychologists",
          localField: "_id",
          foreignField: "_id",
          as: "details"
        }
      },
      { $unwind: "$details" }
    ])
  ]);

  return { totalBookings, statusStats, bookings7Days, mostBookedPsychologists };
};

const getPaymentStats = async () => {
  const [
    totalRevenue,
    paymentStatusStats,
    avgTransaction
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Payment.aggregate([{ $group: { _id: null, avg: { $avg: "$amount" } } }])
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    paymentStatusStats,
    averagePaymentAmount: avgTransaction[0]?.avg || 0
  };
};

export const StatsService = {
  getUserStats,
  getPsychologistStats,
  getSlotStats,
  getBookingStats,
  getPaymentStats,
};