import express ,{  Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import cors from 'cors';
import router from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import expressSession from 'express-session'
import "./app/config/passport"
import { startPaymentExpiryJob } from './app/utils/paymentExpiryJob';
import { envVars } from './app/config/env';



const app = express();


app.use(expressSession({
    secret: "Your Secret",
    resave: false,
    saveUninitialized:false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors(
    {
        origin: envVars.FRONTEND_URL,
        credentials: true
    }
))

app.use("/api/v1/", router);

startPaymentExpiryJob();


app.get ("/", (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
    message: "Welcome to Mon Bhalo Server"})
});


app.use(globalErrorHandler);
app.use(notFound);




export default app;