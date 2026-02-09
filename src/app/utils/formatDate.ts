/**
 * Format date as: DAY/MONTH/YEAR, HOUR:MINUTE:SECOND AM/PM
 * Example: 09/02/2026, 02:30:45 PM
 */
export const formatDateForInvoice = (
  date: Date | string | undefined,
): string => {
  if (!date) return "-";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "-";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const hoursFormatted = String(hours).padStart(2, "0");

  return `${day}/${month}/${year}, ${hoursFormatted}:${minutes}:${seconds} ${ampm}`;
};

/**
 * Format date for display without time (e.g., 09/02/2026)
 */
export const formatDateOnly = (date: Date | string | undefined): string => {
  if (!date) return "-";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "-";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};
