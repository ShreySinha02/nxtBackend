import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
const app = express();

app.use(cors())

app.use(express.json())
app.use(cookieParser())


import createUserRouter from "./router/createUser";
import userRouter from "./router/user";

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/v1/signUp", createUserRouter)
app.use("/api/v1/user",userRouter )



export {app}

