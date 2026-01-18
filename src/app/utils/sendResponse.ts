import { Response } from "express";

interface TMeta {
    total?: number;
    page?: number;
    limit?: number;
}
interface TResponse <T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
}
const sendResponse =<T> (res: Response, data: TResponse<T>) => {

  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
}

export default sendResponse;