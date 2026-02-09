/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";

export interface IInvoiceData {
  bookingId?: string;
  bookingDate?: Date | string;
  transactionId?: string;
  userName?: string;
  userEmail?: string;
  userPhoneNumber?: string;
  psychologistName?: string;
  psychologistEmail?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  sessionFee?: number;
}

export const generatePdf = async (
  invoiceData: IInvoiceData,
): Promise<Buffer<ArrayBufferLike>> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffer: Uint8Array[] = [];

      // Register Bengali font
      doc.registerFont("Bengali", "src/app/fonts/NotoSansBengali-Regular.ttf");

      doc.on("data", (chunk) => buffer.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffer)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.fillColor("#4A90E2").rect(0, 0, 595, 80).fill();
      doc
        .fillColor("#FFFFFF")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("MON BHALO", 50, 20);
      doc.fontSize(12).text("Professional Mental Health Services", 50, 55);
      doc.moveDown(2);

      // Invoice Title and Details
      doc.fillColor("#333333");
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("INVOICE", { align: "center" });
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text(
        `Invoice Number: ${invoiceData.transactionId || invoiceData.bookingId || "-"}`,
      );
      doc.text(`Invoice Date: ${invoiceData.bookingDate || "-"}`);
      doc.moveDown(1);

      // Bill To Section
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("BILL TO", { underline: true });
      doc.fontSize(10).font("Helvetica");
      doc.text(`Client Name: ${invoiceData.userName || "-"}`);
      doc.text(`Client Email: ${invoiceData.userEmail || "-"}`);
      doc.text(`Client Phone Number: ${invoiceData.userPhoneNumber || "-"}`);
      doc.moveDown(1);

      // Service Provider Section
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("SERVICE PROVIDER", { underline: true });
      doc.fontSize(10).font("Helvetica");
      doc.text(`Psychologist Name: ${invoiceData.psychologistName || "-"}`);
      doc.text(`Psychologist Email: ${invoiceData.psychologistEmail || "-"}`);
      doc.moveDown(1);

      // Session Details Table
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 200;
      const col3 = 350;
      const col4 = 500;
      const rowHeight = 25;

      // Table Header
      doc.fillColor("#4A90E2").rect(col1, tableTop, 545, rowHeight).fill();
      doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold");
      doc.text("Description", col1 + 5, tableTop + 7);
      doc.text("Session Date", col2 + 5, tableTop + 7);
      doc.text("Time", col3 + 5, tableTop + 7);
      doc.text("Amount", col4 + 5, tableTop + 7, { align: "right" });

      // Table Row
      doc
        .fillColor("#F5F5F5")
        .rect(col1, tableTop + rowHeight, 545, rowHeight)
        .fill();
      doc.fillColor("#333333").fontSize(10).font("Helvetica");
      doc.text("Therapy Session", col1 + 5, tableTop + rowHeight + 7);
      doc.text(invoiceData.slotDate || "-", col2 + 5, tableTop + rowHeight + 7);
      const timeStr =
        invoiceData.startTime && invoiceData.endTime
          ? `${invoiceData.startTime} - ${invoiceData.endTime}`
          : "-";
      doc.text(timeStr, col3 + 5, tableTop + rowHeight + 7);
      const amount = invoiceData.sessionFee ?? 0;
      const numberText = `${amount}`;
      const symbolWidth = doc.font("Bengali").widthOfString("৳ ");
      const numberWidth = doc.font("Helvetica").widthOfString(numberText);
      const totalWidth = symbolWidth + numberWidth;
      const startX = col4 - 5 - totalWidth;
      doc.font("Bengali").text("৳ ", startX, tableTop + rowHeight + 7);
      doc.font("Helvetica").text(numberText, startX + symbolWidth, tableTop + rowHeight + 7);

      doc
        .moveTo(col1, tableTop + rowHeight * 2)
        .lineTo(col1 + 545, tableTop + rowHeight * 2)
        .stroke();
      doc.moveDown(2.5);

      // Total Section
      const totalY = doc.y;
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("TOTAL AMOUNT:", 50);
      const totalAmount = (invoiceData.sessionFee ?? 0).toFixed(2);
      doc
        .fontSize(14)
        .fillColor("#4A90E2");
      doc.font("Bengali").text("৳ ", 50, totalY + 25, { continued: true });
      doc.font("Helvetica").text(totalAmount, { lineBreak: false });
      doc.font("Helvetica");
      doc.moveDown(4);

      // Footer - Full Page Width and Centered
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#CCCCCC");
      doc.moveDown(1);

      doc.fontSize(9).fillColor("#666666").font("Helvetica");
      doc.text(
        "Thank you for choosing Mon Bhalo for your mental health care!",
        50,
        doc.y,
        { align: "center", width: 495 },
      );
      doc.moveDown(0.5);
      doc.text(
        "If you have any questions, please contact us at support@monbhalo.com",
        50,
        doc.y,
        { align: "center", width: 495 },
      );
      doc.moveDown(0.8);
      doc.fontSize(8).fillColor("#999999");
      doc.text("© 2026 Mon Bhalo - All Rights Reserved", 50, doc.y, {
        align: "center",
        width: 495,
      });

      doc.end();
    });
  } catch (error: any) {
    // console.log(error);
    throw new AppError(401, `Pdf creation error ${error.message}`);
  }
};
